import { TrendingUp, Activity, Droplets, Scale } from 'lucide-react';

// Mock health metrics data
const healthMetrics = {
  bloodPressure: {
    systolic: 120,
    diastolic: 80,
    lastUpdated: '2023-05-22',
    status: 'normal',
  },
  heartRate: {
    value: 72,
    lastUpdated: '2023-05-22',
    status: 'normal',
  },
  glucose: {
    value: 95,
    lastUpdated: '2023-05-21',
    status: 'normal',
  },
  weight: {
    value: 165,
    lastUpdated: '2023-05-20',
    status: 'normal',
  },
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'normal':
      return 'text-success-600 bg-success-50';
    case 'warning':
      return 'text-warning-600 bg-warning-50';
    case 'alert':
      return 'text-error-600 bg-error-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

const HealthMetrics = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center mb-2">
          <Activity className="h-5 w-5 text-primary-500 mr-2" />
          <h3 className="text-sm font-medium text-gray-700">Blood Pressure</h3>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <span className="text-xl font-semibold text-gray-900">
              {healthMetrics.bloodPressure.systolic}/{healthMetrics.bloodPressure.diastolic}
            </span>
            <span className="text-xs text-gray-500 ml-1">mmHg</span>
          </div>
          <div className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(healthMetrics.bloodPressure.status)}`}>
            Normal
          </div>
        </div>
      </div>
      
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center mb-2">
          <TrendingUp className="h-5 w-5 text-accent-500 mr-2" />
          <h3 className="text-sm font-medium text-gray-700">Heart Rate</h3>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <span className="text-xl font-semibold text-gray-900">
              {healthMetrics.heartRate.value}
            </span>
            <span className="text-xs text-gray-500 ml-1">bpm</span>
          </div>
          <div className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(healthMetrics.heartRate.status)}`}>
            Normal
          </div>
        </div>
      </div>
      
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center mb-2">
          <Droplets className="h-5 w-5 text-secondary-500 mr-2" />
          <h3 className="text-sm font-medium text-gray-700">Blood Glucose</h3>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <span className="text-xl font-semibold text-gray-900">
              {healthMetrics.glucose.value}
            </span>
            <span className="text-xs text-gray-500 ml-1">mg/dL</span>
          </div>
          <div className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(healthMetrics.glucose.status)}`}>
            Normal
          </div>
        </div>
      </div>
      
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center mb-2">
          <Scale className="h-5 w-5 text-warning-500 mr-2" />
          <h3 className="text-sm font-medium text-gray-700">Weight</h3>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <span className="text-xl font-semibold text-gray-900">
              {healthMetrics.weight.value}
            </span>
            <span className="text-xs text-gray-500 ml-1">lbs</span>
          </div>
          <div className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(healthMetrics.weight.status)}`}>
            Normal
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthMetrics;