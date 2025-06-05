import { Link } from 'react-router-dom';
import { User, Calendar, Clock } from 'lucide-react';

// Mock patients data
const patients = [
  {
    id: '1',
    name: 'John Doe',
    age: 45,
    lastVisit: '2023-05-18',
    nextAppointment: '2023-05-25',
    condition: 'Hypertension',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    age: 38,
    lastVisit: '2023-05-15',
    nextAppointment: '2023-05-29',
    condition: 'Diabetes Type 2',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: '3',
    name: 'Michael Brown',
    age: 52,
    lastVisit: '2023-05-12',
    nextAppointment: '2023-06-02',
    condition: 'Arthritis',
    avatar: 'https://randomuser.me/api/portraits/men/62.jpg',
  },
];

const PatientsList = () => {
  if (patients.length === 0) {
    return (
      <div className="text-center py-6">
        <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900">No patients yet</h3>
        <p className="text-gray-500">Your patient list will appear here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Patient
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Condition
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Visit
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Next Appointment
            </th>
            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {patients.map((patient) => (
            <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    {patient.avatar ? (
                      <img 
                        className="h-10 w-10 rounded-full object-cover" 
                        src={patient.avatar} 
                        alt={patient.name} 
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-medium">
                          {patient.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                    <div className="text-xs text-gray-500">{patient.age} years</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {patient.condition}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                  {new Date(patient.lastVisit).toLocaleDateString()}
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-1" />
                  {new Date(patient.nextAppointment).toLocaleDateString()}
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                <Link
                  to={`/patients/${patient.id}`}
                  className="text-primary-600 hover:text-primary-900 mr-3"
                >
                  View
                </Link>
                <Link
                  to={`/consultation/new?patient=${patient.id}`}
                  className="text-secondary-600 hover:text-secondary-900"
                >
                  Consult
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientsList;