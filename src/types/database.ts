export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'patient' | 'doctor' | 'admin' | 'nurse'
          phone: string | null
          date_of_birth: string | null
          gender: 'male' | 'female' | 'other' | null
          address: string | null
          emergency_contact: Json | null
          medical_license: string | null
          specialization: string | null
          department: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'patient' | 'doctor' | 'admin' | 'nurse'
          phone?: string | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | null
          address?: string | null
          emergency_contact?: Json | null
          medical_license?: string | null
          specialization?: string | null
          department?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'patient' | 'doctor' | 'admin' | 'nurse'
          phone?: string | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | null
          address?: string | null
          emergency_contact?: Json | null
          medical_license?: string | null
          specialization?: string | null
          department?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      medical_records: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string | null
          title: string
          description: string | null
          diagnosis: string | null
          symptoms: Json | null
          medications: Json | null
          allergies: Json | null
          vital_signs: Json | null
          lab_results: Json | null
          imaging_results: Json | null
          treatment_plan: string | null
          notes: string | null
          attachments: Json | null
          record_type: 'consultation' | 'diagnosis' | 'prescription' | 'lab_result' | 'imaging' | 'other'
          status: 'draft' | 'active' | 'archived'
          visit_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id?: string | null
          title: string
          description?: string | null
          diagnosis?: string | null
          symptoms?: Json | null
          medications?: Json | null
          allergies?: Json | null
          vital_signs?: Json | null
          lab_results?: Json | null
          imaging_results?: Json | null
          treatment_plan?: string | null
          notes?: string | null
          attachments?: Json | null
          record_type?: 'consultation' | 'diagnosis' | 'prescription' | 'lab_result' | 'imaging' | 'other'
          status?: 'draft' | 'active' | 'archived'
          visit_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string | null
          title?: string
          description?: string | null
          diagnosis?: string | null
          symptoms?: Json | null
          medications?: Json | null
          allergies?: Json | null
          vital_signs?: Json | null
          lab_results?: Json | null
          imaging_results?: Json | null
          treatment_plan?: string | null
          notes?: string | null
          attachments?: Json | null
          record_type?: 'consultation' | 'diagnosis' | 'prescription' | 'lab_result' | 'imaging' | 'other'
          status?: 'draft' | 'active' | 'archived'
          visit_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          title: string
          description: string | null
          appointment_date: string
          duration: number
          status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          appointment_type: 'consultation' | 'follow_up' | 'emergency' | 'routine_checkup'
          meeting_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          title: string
          description?: string | null
          appointment_date: string
          duration?: number
          status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          appointment_type?: 'consultation' | 'follow_up' | 'emergency' | 'routine_checkup'
          meeting_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string
          title?: string
          description?: string | null
          appointment_date?: string
          duration?: number
          status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          appointment_type?: 'consultation' | 'follow_up' | 'emergency' | 'routine_checkup'
          meeting_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      prescriptions: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          medical_record_id: string | null
          medication_name: string
          dosage: string
          frequency: string
          duration: string
          instructions: string | null
          quantity: number | null
          refills: number | null
          status: 'active' | 'completed' | 'cancelled'
          prescribed_date: string
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          medical_record_id?: string | null
          medication_name: string
          dosage: string
          frequency: string
          duration: string
          instructions?: string | null
          quantity?: number | null
          refills?: number | null
          status?: 'active' | 'completed' | 'cancelled'
          prescribed_date?: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string
          medical_record_id?: string | null
          medication_name?: string
          dosage?: string
          frequency?: string
          duration?: string
          instructions?: string | null
          quantity?: number | null
          refills?: number | null
          status?: 'active' | 'completed' | 'cancelled'
          prescribed_date?: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_channels: {
        Row: {
          id: string
          name: string
          type: 'consultation' | 'support' | 'general'
          participants: string[]
          created_by: string
          is_active: boolean
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type?: 'consultation' | 'support' | 'general'
          participants: string[]
          created_by: string
          is_active?: boolean
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'consultation' | 'support' | 'general'
          participants?: string[]
          created_by?: string
          is_active?: boolean
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          channel_id: string
          sender_id: string
          content: string
          message_type: 'text' | 'file' | 'image' | 'system'
          file_url: string | null
          file_name: string | null
          file_size: number | null
          metadata: Json | null
          is_edited: boolean
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          channel_id: string
          sender_id: string
          content: string
          message_type?: 'text' | 'file' | 'image' | 'system'
          file_url?: string | null
          file_name?: string | null
          file_size?: number | null
          metadata?: Json | null
          is_edited?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          channel_id?: string
          sender_id?: string
          content?: string
          message_type?: 'text' | 'file' | 'image' | 'system'
          file_url?: string | null
          file_name?: string | null
          file_size?: number | null
          metadata?: Json | null
          is_edited?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      diagnosis_sessions: {
        Row: {
          id: string
          patient_id: string
          session_data: Json
          symptoms: Json | null
          conditions: Json | null
          triage_result: Json | null
          status: 'active' | 'completed' | 'abandoned'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          session_data: Json
          symptoms?: Json | null
          conditions?: Json | null
          triage_result?: Json | null
          status?: 'active' | 'completed' | 'abandoned'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          session_data?: Json
          symptoms?: Json | null
          conditions?: Json | null
          triage_result?: Json | null
          status?: 'active' | 'completed' | 'abandoned'
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'appointment' | 'message' | 'prescription' | 'system' | 'emergency'
          data: Json | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: 'appointment' | 'message' | 'prescription' | 'system' | 'emergency'
          data?: Json | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'appointment' | 'message' | 'prescription' | 'system' | 'emergency'
          data?: Json | null
          is_read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'patient' | 'doctor' | 'admin' | 'nurse'
      appointment_status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
      record_status: 'draft' | 'active' | 'archived'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
