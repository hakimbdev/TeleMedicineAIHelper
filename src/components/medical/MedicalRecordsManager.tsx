import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Calendar, 
  User, 
  Stethoscope,
  Edit,
  Trash2,
  Download,
  Upload,
  Eye,
  AlertCircle
} from 'lucide-react';
import { useMedicalRecords } from '../../hooks/useMedicalRecords';
import { useAuth } from '../../hooks/useAuth';
import { Database } from '../../types/database';
import { formatDistanceToNow } from 'date-fns';

type MedicalRecord = Database['public']['Tables']['medical_records']['Row'];

interface MedicalRecordsManagerProps {
  patientId?: string;
  className?: string;
}

const MedicalRecordsManager: React.FC<MedicalRecordsManagerProps> = ({
  patientId,
  className = '',
}) => {
  const { user } = useAuth();
  const {
    records,
    loading,
    error,
    createMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,
    uploadMedicalFile,
    clearError,
  } = useMedicalRecords();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showRecordDetail, setShowRecordDetail] = useState(false);

  // Filter records based on search and filter criteria
  const filteredRecords = records.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || record.record_type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const handleCreateRecord = async (formData: any) => {
    try {
      await createMedicalRecord(formData, patientId);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating record:', error);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (window.confirm('Are you sure you want to delete this medical record?')) {
      try {
        await deleteMedicalRecord(recordId);
      } catch (error) {
        console.error('Error deleting record:', error);
      }
    }
  };

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'bg-blue-100 text-blue-800';
      case 'diagnosis':
        return 'bg-green-100 text-green-800';
      case 'prescription':
        return 'bg-purple-100 text-purple-800';
      case 'lab_result':
        return 'bg-yellow-100 text-yellow-800';
      case 'imaging':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation':
        return <Stethoscope className="w-4 h-4" />;
      case 'diagnosis':
        return <FileText className="w-4 h-4" />;
      case 'prescription':
        return <FileText className="w-4 h-4" />;
      case 'lab_result':
        return <FileText className="w-4 h-4" />;
      case 'imaging':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-card overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Medical Records</h2>
            <p className="text-gray-600 mt-1">
              {patientId ? 'Patient medical history' : 'Manage medical records'}
            </p>
          </div>
          
          {(user?.role === 'doctor' || user?.role === 'admin') && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Record</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search records by title, diagnosis, or description..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="consultation">Consultations</option>
              <option value="diagnosis">Diagnoses</option>
              <option value="prescription">Prescriptions</option>
              <option value="lab_result">Lab Results</option>
              <option value="imaging">Imaging</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-6 py-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
            <button
              onClick={clearError}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Records List */}
      <div className="divide-y divide-gray-200">
        {loading ? (
          <div className="px-6 py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading medical records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Medical Records</h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== 'all' 
                ? 'No records match your search criteria.' 
                : 'No medical records found. Create your first record to get started.'}
            </p>
          </div>
        ) : (
          filteredRecords.map((record) => (
            <div key={record.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getRecordTypeColor(record.record_type)}`}>
                      {getRecordTypeIcon(record.record_type)}
                      <span className="capitalize">{record.record_type.replace('_', ' ')}</span>
                    </div>
                    
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : record.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {record.status}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{record.title}</h3>
                  
                  {record.description && (
                    <p className="text-gray-600 mb-2 line-clamp-2">{record.description}</p>
                  )}
                  
                  {record.diagnosis && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-700">Diagnosis: </span>
                      <span className="text-sm text-gray-600">{record.diagnosis}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(record.visit_date).toLocaleDateString()}</span>
                    </div>
                    
                    {(record as any).doctor && (
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{(record as any).doctor.full_name}</span>
                      </div>
                    )}
                    
                    <span>
                      Updated {formatDistanceToNow(new Date(record.updated_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => {
                      setSelectedRecord(record);
                      setShowRecordDetail(true);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  {(user?.role === 'doctor' || user?.role === 'admin') && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedRecord(record);
                          setShowCreateForm(true);
                        }}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Edit record"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <CreateRecordModal
          record={selectedRecord}
          onSave={handleCreateRecord}
          onClose={() => {
            setShowCreateForm(false);
            setSelectedRecord(null);
          }}
        />
      )}

      {/* Record Detail Modal */}
      {showRecordDetail && selectedRecord && (
        <RecordDetailModal
          record={selectedRecord}
          onClose={() => {
            setShowRecordDetail(false);
            setSelectedRecord(null);
          }}
        />
      )}
    </div>
  );
};

// Create Record Modal Component
const CreateRecordModal: React.FC<{
  record?: MedicalRecord | null;
  onSave: (data: any) => void;
  onClose: () => void;
}> = ({ record, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: record?.title || '',
    description: record?.description || '',
    diagnosis: record?.diagnosis || '',
    record_type: record?.record_type || 'consultation',
    treatment_plan: record?.treatment_plan || '',
    notes: record?.notes || '',
    visit_date: record?.visit_date ? new Date(record.visit_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {record ? 'Edit Medical Record' : 'Create New Medical Record'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Record Type</label>
              <select
                value={formData.record_type}
                onChange={(e) => setFormData(prev => ({ ...prev, record_type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="consultation">Consultation</option>
                <option value="diagnosis">Diagnosis</option>
                <option value="prescription">Prescription</option>
                <option value="lab_result">Lab Result</option>
                <option value="imaging">Imaging</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Visit Date</label>
            <input
              type="date"
              value={formData.visit_date}
              onChange={(e) => setFormData(prev => ({ ...prev, visit_date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
            <textarea
              value={formData.diagnosis}
              onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Plan</label>
            <textarea
              value={formData.treatment_plan}
              onChange={(e) => setFormData(prev => ({ ...prev, treatment_plan: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              {record ? 'Update Record' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Record Detail Modal Component
const RecordDetailModal: React.FC<{
  record: MedicalRecord;
  onClose: () => void;
}> = ({ record, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">{record.title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Record Information</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Type:</span> {record.record_type.replace('_', ' ')}</div>
                <div><span className="font-medium">Status:</span> {record.status}</div>
                <div><span className="font-medium">Visit Date:</span> {new Date(record.visit_date).toLocaleDateString()}</div>
                <div><span className="font-medium">Created:</span> {new Date(record.created_at).toLocaleDateString()}</div>
              </div>
            </div>
            
            {(record as any).doctor && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Healthcare Provider</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Doctor:</span> {(record as any).doctor.full_name}</div>
                  <div><span className="font-medium">Specialization:</span> {(record as any).doctor.specialization || 'N/A'}</div>
                  <div><span className="font-medium">License:</span> {(record as any).doctor.medical_license || 'N/A'}</div>
                </div>
              </div>
            )}
          </div>
          
          {record.description && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{record.description}</p>
            </div>
          )}
          
          {record.diagnosis && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Diagnosis</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{record.diagnosis}</p>
            </div>
          )}
          
          {record.treatment_plan && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Treatment Plan</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{record.treatment_plan}</p>
            </div>
          )}
          
          {record.notes && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{record.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordsManager;
