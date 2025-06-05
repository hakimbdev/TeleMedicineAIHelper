import { useState } from 'react';
import { Pill, Calendar, User, Clock, AlertCircle, CheckCircle, Search, Filter } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  prescribedBy: string;
  prescribedDate: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'discontinued';
  instructions: string;
  refillsRemaining: number;
  totalRefills: number;
}

const PrescriptionsPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  // Mock prescriptions data
  const prescriptions: Prescription[] = [
    {
      id: '1',
      medicationName: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      duration: '30 days',
      prescribedBy: 'Dr. Jane Smith',
      prescribedDate: '2023-05-20',
      startDate: '2023-05-21',
      endDate: '2023-06-20',
      status: 'active',
      instructions: 'Take with food. Monitor blood pressure regularly.',
      refillsRemaining: 2,
      totalRefills: 3,
    },
    {
      id: '2',
      medicationName: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      duration: '90 days',
      prescribedBy: 'Dr. Michael Chen',
      prescribedDate: '2023-04-15',
      startDate: '2023-04-16',
      endDate: '2023-07-15',
      status: 'active',
      instructions: 'Take with meals to reduce stomach upset.',
      refillsRemaining: 1,
      totalRefills: 2,
    },
    {
      id: '3',
      medicationName: 'Amoxicillin',
      dosage: '250mg',
      frequency: 'Three times daily',
      duration: '7 days',
      prescribedBy: 'Dr. Sarah Johnson',
      prescribedDate: '2023-03-10',
      startDate: '2023-03-11',
      endDate: '2023-03-18',
      status: 'completed',
      instructions: 'Complete the full course even if symptoms improve.',
      refillsRemaining: 0,
      totalRefills: 0,
    },
    {
      id: '4',
      medicationName: 'Ibuprofen',
      dosage: '400mg',
      frequency: 'As needed',
      duration: '14 days',
      prescribedBy: 'Dr. Jane Smith',
      prescribedDate: '2023-02-28',
      startDate: '2023-03-01',
      endDate: '2023-03-15',
      status: 'discontinued',
      instructions: 'Take with food. Do not exceed 3 doses per day.',
      refillsRemaining: 0,
      totalRefills: 1,
    },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Prescriptions' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'discontinued', label: 'Discontinued' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'discontinued':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'discontinued':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.medicationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.prescribedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || prescription.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleRequestRefill = (prescription: Prescription) => {
    console.log('Requesting refill for:', prescription.medicationName);
    // Implement refill request logic
  };

  const handleViewDetails = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
        <p className="text-gray-600 mt-1">Manage your medications and prescriptions</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-xl shadow-card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search prescriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Active Prescriptions Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <Pill className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Prescriptions</p>
              <p className="text-2xl font-bold text-gray-900">
                {prescriptions.filter(p => p.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Refills Needed</p>
              <p className="text-2xl font-bold text-gray-900">
                {prescriptions.filter(p => p.status === 'active' && p.refillsRemaining <= 1).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {prescriptions.filter(p => p.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="bg-white rounded-xl shadow-card">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Your Prescriptions ({filteredPrescriptions.length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredPrescriptions.map((prescription) => (
            <div key={prescription.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Pill className="h-8 w-8 text-primary-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {prescription.medicationName}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(prescription.status)}`}>
                        {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {prescription.dosage} • {prescription.frequency}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {prescription.prescribedBy}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(prescription.prescribedDate).toLocaleDateString()}
                      </div>
                      {prescription.status === 'active' && (
                        <span>
                          Refills: {prescription.refillsRemaining}/{prescription.totalRefills}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {prescription.status === 'active' && prescription.refillsRemaining > 0 && (
                    <button
                      onClick={() => handleRequestRefill(prescription)}
                      className="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      Request Refill
                    </button>
                  )}
                  <button
                    onClick={() => handleViewDetails(prescription)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPrescriptions.length === 0 && (
          <div className="p-12 text-center">
            <Pill className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Your prescriptions will appear here once prescribed by your doctor'
              }
            </p>
          </div>
        )}
      </div>

      {/* Prescription Details Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">{selectedPrescription.medicationName}</h2>
                <button
                  onClick={() => setSelectedPrescription(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700">Dosage</label>
                  <p className="text-gray-900">{selectedPrescription.dosage}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Frequency</label>
                  <p className="text-gray-900">{selectedPrescription.frequency}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Duration</label>
                  <p className="text-gray-900">{selectedPrescription.duration}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedPrescription.status)}
                    <span className="text-gray-900 capitalize">{selectedPrescription.status}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Prescribed By</label>
                  <p className="text-gray-900">{selectedPrescription.prescribedBy}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Prescribed Date</label>
                  <p className="text-gray-900">{new Date(selectedPrescription.prescribedDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Start Date</label>
                  <p className="text-gray-900">{new Date(selectedPrescription.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">End Date</label>
                  <p className="text-gray-900">{new Date(selectedPrescription.endDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="mt-6">
                <label className="text-sm font-medium text-gray-700">Instructions</label>
                <p className="text-gray-900 mt-1">{selectedPrescription.instructions}</p>
              </div>
              {selectedPrescription.status === 'active' && (
                <div className="mt-6">
                  <label className="text-sm font-medium text-gray-700">Refills</label>
                  <p className="text-gray-900 mt-1">
                    {selectedPrescription.refillsRemaining} remaining out of {selectedPrescription.totalRefills} total
                  </p>
                </div>
              )}
              <div className="mt-6 flex justify-end space-x-3">
                {selectedPrescription.status === 'active' && selectedPrescription.refillsRemaining > 0 && (
                  <button
                    onClick={() => handleRequestRefill(selectedPrescription)}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Request Refill
                  </button>
                )}
                <button
                  onClick={() => setSelectedPrescription(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionsPage;
