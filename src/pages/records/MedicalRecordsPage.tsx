import React, { useState } from 'react';
import { ArrowLeft, FileText, Users, Activity, TrendingUp, Database, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useMedicalRecords } from '../../hooks/useMedicalRecords';
import MedicalRecordsManager from '../../components/medical/MedicalRecordsManager';

const MedicalRecordsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { records, loading } = useMedicalRecords();

  // Calculate statistics
  const totalRecords = records.length;
  const recentRecords = records.filter(record => {
    const recordDate = new Date(record.visit_date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return recordDate >= thirtyDaysAgo;
  }).length;

  const recordsByType = records.reduce((acc, record) => {
    acc[record.record_type] = (acc[record.record_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);



  return (
    <div className="min-h-[calc(100vh-140px)] bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
                <p className="text-gray-600">Manage patient medical records and history</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Supabase Connected</span>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-card p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-xl font-bold text-gray-900">{totalRecords}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-card p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Recent (30 days)</p>
                <p className="text-xl font-bold text-gray-900">{recentRecords}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-card p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Patients</p>
                <p className="text-xl font-bold text-gray-900">
                  {new Set(records.map(r => r.patient_id)).size}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-card p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Records</p>
                <p className="text-xl font-bold text-gray-900">
                  {records.filter(r => r.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Records Manager */}
        <MedicalRecordsManager className="min-h-[600px]" />

        {/* Features Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Database className="w-8 h-8 text-blue-500" />
              <div>
                <h3 className="text-sm font-medium text-blue-900">Supabase Database</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Real-time PostgreSQL database with row-level security for medical records
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="text-sm font-medium text-green-900">Medical Records Management</h3>
                <p className="text-sm text-green-700 mt-1">
                  Complete CRUD operations with file attachments and medical data tracking
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-purple-500" />
              <div>
                <h3 className="text-sm font-medium text-purple-900">Role-based Access</h3>
                <p className="text-sm text-purple-700 mt-1">
                  Secure access controls ensuring patients see only their records
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Database Schema Info */}
        <div className="mt-6 bg-white rounded-lg shadow-card p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Database Schema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border border-gray-200 rounded-lg p-3">
              <h3 className="font-medium text-gray-900 mb-2">Profiles</h3>
              <p className="text-sm text-gray-600">User profiles with role-based access</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <h3 className="font-medium text-gray-900 mb-2">Medical Records</h3>
              <p className="text-sm text-gray-600">Patient medical history and documents</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <h3 className="font-medium text-gray-900 mb-2">Appointments</h3>
              <p className="text-sm text-gray-600">Scheduled consultations and meetings</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <h3 className="font-medium text-gray-900 mb-2">Prescriptions</h3>
              <p className="text-sm text-gray-600">Medication prescriptions and tracking</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordsPage;
