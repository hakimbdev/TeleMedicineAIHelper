-- TeleMedicine AI Helper Database Schema
-- This file contains the complete database schema for Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'admin', 'nurse');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE record_status AS ENUM ('draft', 'active', 'archived');
CREATE TYPE record_type AS ENUM ('consultation', 'diagnosis', 'prescription', 'lab_result', 'imaging', 'other');
CREATE TYPE message_type AS ENUM ('text', 'file', 'image', 'system');
CREATE TYPE channel_type AS ENUM ('consultation', 'support', 'general');
CREATE TYPE notification_type AS ENUM ('appointment', 'message', 'prescription', 'system', 'emergency');
CREATE TYPE prescription_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE session_status AS ENUM ('active', 'completed', 'abandoned');

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'patient',
    phone TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    address TEXT,
    emergency_contact JSONB,
    medical_license TEXT,
    specialization TEXT,
    department TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical records table
CREATE TABLE medical_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    diagnosis TEXT,
    symptoms JSONB,
    medications JSONB,
    allergies JSONB,
    vital_signs JSONB,
    lab_results JSONB,
    imaging_results JSONB,
    treatment_plan TEXT,
    notes TEXT,
    attachments JSONB,
    record_type record_type DEFAULT 'consultation',
    status record_status DEFAULT 'active',
    visit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE appointments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER DEFAULT 30, -- in minutes
    status appointment_status DEFAULT 'scheduled',
    appointment_type TEXT DEFAULT 'consultation',
    meeting_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescriptions table
CREATE TABLE prescriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    medical_record_id UUID REFERENCES medical_records(id) ON DELETE SET NULL,
    medication_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    duration TEXT NOT NULL,
    instructions TEXT,
    quantity INTEGER,
    refills INTEGER DEFAULT 0,
    status prescription_status DEFAULT 'active',
    prescribed_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat channels table
CREATE TABLE chat_channels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    type channel_type DEFAULT 'general',
    participants UUID[] NOT NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    message_type message_type DEFAULT 'text',
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    metadata JSONB,
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diagnosis sessions table (for AI diagnosis)
CREATE TABLE diagnosis_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    session_data JSONB NOT NULL,
    symptoms JSONB,
    conditions JSONB,
    triage_result JSONB,
    status session_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type notification_type DEFAULT 'system',
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX idx_medical_records_doctor ON medical_records(doctor_id);
CREATE INDEX idx_medical_records_date ON medical_records(visit_date);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX idx_chat_messages_channel ON chat_messages(channel_id);
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_channels_updated_at BEFORE UPDATE ON chat_channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON chat_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_diagnosis_sessions_updated_at BEFORE UPDATE ON diagnosis_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnosis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Doctors can view patient profiles" ON profiles FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.id = auth.uid() 
        AND p.role IN ('doctor', 'admin')
    )
);

-- Medical records policies
CREATE POLICY "Patients can view own medical records" ON medical_records FOR SELECT USING (
    patient_id = auth.uid()
);
CREATE POLICY "Doctors can view their patients' records" ON medical_records FOR SELECT USING (
    doctor_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.id = auth.uid() 
        AND p.role IN ('doctor', 'admin')
    )
);
CREATE POLICY "Doctors can create medical records" ON medical_records FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.id = auth.uid() 
        AND p.role IN ('doctor', 'admin')
    )
);
CREATE POLICY "Doctors can update medical records" ON medical_records FOR UPDATE USING (
    doctor_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.id = auth.uid() 
        AND p.role IN ('doctor', 'admin')
    )
);

-- Appointments policies
CREATE POLICY "Users can view own appointments" ON appointments FOR SELECT USING (
    patient_id = auth.uid() OR doctor_id = auth.uid()
);
CREATE POLICY "Users can create appointments" ON appointments FOR INSERT WITH CHECK (
    patient_id = auth.uid() OR doctor_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.id = auth.uid() 
        AND p.role IN ('admin')
    )
);
CREATE POLICY "Users can update own appointments" ON appointments FOR UPDATE USING (
    patient_id = auth.uid() OR doctor_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.id = auth.uid() 
        AND p.role IN ('admin')
    )
);

-- Prescriptions policies
CREATE POLICY "Patients can view own prescriptions" ON prescriptions FOR SELECT USING (
    patient_id = auth.uid()
);
CREATE POLICY "Doctors can view their prescriptions" ON prescriptions FOR SELECT USING (
    doctor_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.id = auth.uid() 
        AND p.role IN ('doctor', 'admin')
    )
);
CREATE POLICY "Doctors can create prescriptions" ON prescriptions FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.id = auth.uid() 
        AND p.role IN ('doctor', 'admin')
    )
);

-- Chat channels policies
CREATE POLICY "Users can view channels they participate in" ON chat_channels FOR SELECT USING (
    auth.uid() = ANY(participants)
);
CREATE POLICY "Users can create channels" ON chat_channels FOR INSERT WITH CHECK (
    auth.uid() = created_by
);
CREATE POLICY "Channel creators can update channels" ON chat_channels FOR UPDATE USING (
    auth.uid() = created_by OR
    EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.id = auth.uid() 
        AND p.role IN ('admin')
    )
);

-- Chat messages policies
CREATE POLICY "Users can view messages in their channels" ON chat_messages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM chat_channels c 
        WHERE c.id = channel_id 
        AND auth.uid() = ANY(c.participants)
    )
);
CREATE POLICY "Users can send messages to their channels" ON chat_messages FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM chat_channels c 
        WHERE c.id = channel_id 
        AND auth.uid() = ANY(c.participants)
    ) AND sender_id = auth.uid()
);
CREATE POLICY "Users can update own messages" ON chat_messages FOR UPDATE USING (
    sender_id = auth.uid()
);

-- Diagnosis sessions policies
CREATE POLICY "Patients can view own diagnosis sessions" ON diagnosis_sessions FOR SELECT USING (
    patient_id = auth.uid()
);
CREATE POLICY "Patients can create diagnosis sessions" ON diagnosis_sessions FOR INSERT WITH CHECK (
    patient_id = auth.uid()
);
CREATE POLICY "Patients can update own diagnosis sessions" ON diagnosis_sessions FOR UPDATE USING (
    patient_id = auth.uid()
);
CREATE POLICY "Doctors can view diagnosis sessions" ON diagnosis_sessions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.id = auth.uid() 
        AND p.role IN ('doctor', 'admin')
    )
);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (
    user_id = auth.uid()
);
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (
    user_id = auth.uid()
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
('avatars', 'avatars', true),
('medical-files', 'medical-files', false);

-- Storage policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Medical files are private" ON storage.objects FOR SELECT USING (
    bucket_id = 'medical-files' AND
    (
        auth.uid()::text = (storage.foldername(name))[1] OR
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role IN ('doctor', 'admin')
        )
    )
);
CREATE POLICY "Authenticated users can upload medical files" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'medical-files' AND 
    auth.role() = 'authenticated'
);
