import { useState, useEffect, useCallback } from 'react';
import { supabase, TABLES, handleSupabaseError } from '../config/supabase';
import { Database } from '../types/database';
import { useSupabaseAuth } from './useSupabaseAuth';

type MedicalRecord = Database['public']['Tables']['medical_records']['Row'];
type MedicalRecordInsert = Database['public']['Tables']['medical_records']['Insert'];
type MedicalRecordUpdate = Database['public']['Tables']['medical_records']['Update'];

interface MedicalRecordsState {
  records: MedicalRecord[];
  loading: boolean;
  error: string | null;
}

interface CreateMedicalRecordData {
  title: string;
  description?: string;
  diagnosis?: string;
  symptoms?: any;
  medications?: any;
  allergies?: any;
  vital_signs?: any;
  lab_results?: any;
  imaging_results?: any;
  treatment_plan?: string;
  notes?: string;
  record_type?: 'consultation' | 'diagnosis' | 'prescription' | 'lab_result' | 'imaging' | 'other';
  visit_date?: string;
  doctor_id?: string;
}

export const useMedicalRecords = () => {
  const { user, profile, userRole } = useSupabaseAuth();
  const [state, setState] = useState<MedicalRecordsState>({
    records: [],
    loading: false,
    error: null,
  });

  // Fetch medical records
  const fetchMedicalRecords = useCallback(async (patientId?: string) => {
    if (!user || !profile) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      let query = supabase
        .from(TABLES.MEDICAL_RECORDS)
        .select(`
          *,
          patient:profiles!medical_records_patient_id_fkey(
            id,
            full_name,
            email,
            date_of_birth,
            gender
          ),
          doctor:profiles!medical_records_doctor_id_fkey(
            id,
            full_name,
            email,
            specialization,
            medical_license
          )
        `)
        .order('visit_date', { ascending: false });

      // Apply role-based filtering
      if (userRole === 'patient') {
        // Patients can only see their own records
        query = query.eq('patient_id', user.id);
      } else if (userRole === 'doctor') {
        // Doctors can see records for their patients or records they created
        if (patientId) {
          query = query.eq('patient_id', patientId);
        } else {
          query = query.eq('doctor_id', user.id);
        }
      } else if (userRole === 'admin') {
        // Admins can see all records, optionally filtered by patient
        if (patientId) {
          query = query.eq('patient_id', patientId);
        }
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setState(prev => ({
        ...prev,
        records: data || [],
        loading: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch medical records',
      }));
    }
  }, [user, profile, userRole]);

  // Create medical record
  const createMedicalRecord = useCallback(async (
    data: CreateMedicalRecordData,
    patientId?: string
  ): Promise<MedicalRecord> => {
    if (!user || !profile) {
      throw new Error('User not authenticated');
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Determine patient ID
      const targetPatientId = patientId || (userRole === 'patient' ? user.id : undefined);
      
      if (!targetPatientId) {
        throw new Error('Patient ID is required');
      }

      const recordData: MedicalRecordInsert = {
        patient_id: targetPatientId,
        doctor_id: userRole === 'doctor' ? user.id : data.doctor_id || null,
        title: data.title,
        description: data.description || null,
        diagnosis: data.diagnosis || null,
        symptoms: data.symptoms || null,
        medications: data.medications || null,
        allergies: data.allergies || null,
        vital_signs: data.vital_signs || null,
        lab_results: data.lab_results || null,
        imaging_results: data.imaging_results || null,
        treatment_plan: data.treatment_plan || null,
        notes: data.notes || null,
        record_type: data.record_type || 'consultation',
        status: 'active',
        visit_date: data.visit_date || new Date().toISOString(),
      };

      const { data: newRecord, error } = await supabase
        .from(TABLES.MEDICAL_RECORDS)
        .insert(recordData)
        .select(`
          *,
          patient:profiles!medical_records_patient_id_fkey(
            id,
            full_name,
            email,
            date_of_birth,
            gender
          ),
          doctor:profiles!medical_records_doctor_id_fkey(
            id,
            full_name,
            email,
            specialization,
            medical_license
          )
        `)
        .single();

      if (error) {
        throw error;
      }

      setState(prev => ({
        ...prev,
        records: [newRecord, ...prev.records],
        loading: false,
      }));

      return newRecord;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to create medical record',
      }));
      throw error;
    }
  }, [user, profile, userRole]);

  // Update medical record
  const updateMedicalRecord = useCallback(async (
    recordId: string,
    updates: Partial<CreateMedicalRecordData>
  ): Promise<MedicalRecord> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const updateData: MedicalRecordUpdate = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data: updatedRecord, error } = await supabase
        .from(TABLES.MEDICAL_RECORDS)
        .update(updateData)
        .eq('id', recordId)
        .select(`
          *,
          patient:profiles!medical_records_patient_id_fkey(
            id,
            full_name,
            email,
            date_of_birth,
            gender
          ),
          doctor:profiles!medical_records_doctor_id_fkey(
            id,
            full_name,
            email,
            specialization,
            medical_license
          )
        `)
        .single();

      if (error) {
        throw error;
      }

      setState(prev => ({
        ...prev,
        records: prev.records.map(record =>
          record.id === recordId ? updatedRecord : record
        ),
        loading: false,
      }));

      return updatedRecord;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to update medical record',
      }));
      throw error;
    }
  }, [user]);

  // Delete medical record
  const deleteMedicalRecord = useCallback(async (recordId: string): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase
        .from(TABLES.MEDICAL_RECORDS)
        .delete()
        .eq('id', recordId);

      if (error) {
        throw error;
      }

      setState(prev => ({
        ...prev,
        records: prev.records.filter(record => record.id !== recordId),
        loading: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to delete medical record',
      }));
      throw error;
    }
  }, [user]);

  // Get medical record by ID
  const getMedicalRecord = useCallback(async (recordId: string): Promise<MedicalRecord | null> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.MEDICAL_RECORDS)
        .select(`
          *,
          patient:profiles!medical_records_patient_id_fkey(
            id,
            full_name,
            email,
            date_of_birth,
            gender
          ),
          doctor:profiles!medical_records_doctor_id_fkey(
            id,
            full_name,
            email,
            specialization,
            medical_license
          )
        `)
        .eq('id', recordId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data || null;
    } catch (error: any) {
      console.error('Error fetching medical record:', error);
      return null;
    }
  }, []);

  // Upload medical file
  const uploadMedicalFile = useCallback(async (
    recordId: string,
    file: File,
    fileType: 'lab_result' | 'imaging' | 'document' | 'other' = 'document'
  ): Promise<string> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${recordId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('medical-files')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('medical-files')
        .getPublicUrl(fileName);

      // Update the medical record with the file attachment
      const record = await getMedicalRecord(recordId);
      if (record) {
        const currentAttachments = record.attachments as any[] || [];
        const newAttachment = {
          id: Date.now().toString(),
          name: file.name,
          url: publicUrl,
          type: fileType,
          size: file.size,
          uploaded_at: new Date().toISOString(),
        };

        await updateMedicalRecord(recordId, {
          attachments: [...currentAttachments, newAttachment],
        });
      }

      return publicUrl;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to upload file');
    }
  }, [user, getMedicalRecord, updateMedicalRecord]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Auto-fetch records when user changes
  useEffect(() => {
    if (user && profile) {
      fetchMedicalRecords();
    }
  }, [user, profile, fetchMedicalRecords]);

  return {
    // State
    records: state.records,
    loading: state.loading,
    error: state.error,

    // Actions
    fetchMedicalRecords,
    createMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,
    getMedicalRecord,
    uploadMedicalFile,
    clearError,
  };
};
