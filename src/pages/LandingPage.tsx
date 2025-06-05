import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Video, Bot, Calendar, ChevronRight, CheckCircle, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const [selectedTab, setSelectedTab] = useState<'patients' | 'doctors'>('patients');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary-50 via-white to-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between relative">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <div className="inline-flex items-center gap-2 bg-primary-50 px-3 py-1 rounded-full text-primary-600 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              Now offering 24/7 AI Health Assistant
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Healthcare at Your Fingertips with <span className="text-primary-500">TeleMed</span><span className="bg-gradient-to-r from-primary-500 to-accent-400 text-transparent bg-clip-text">AI</span>
            </h1>
            <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-lg leading-relaxed">
              Connect with healthcare professionals from anywhere or get AI-powered health assistance 24/7. Your health journey, simplified.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="group px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 flex items-center"
              >
                Get Started <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg border border-primary-200 hover:bg-primary-50 transition-all flex items-center"
              >
                Log In <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src="https://images.pexels.com/photos/7089401/pexels-photo-7089401.jpeg" 
              alt="Doctor with digital tablet" 
              className="rounded-xl shadow-lg w-full max-w-lg mx-auto"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose TeleMed<span className="text-accent-400">AI</span>?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl hover:shadow-card-hover transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Video className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Video Consultations</h3>
              <p className="text-gray-600">
                Meet with healthcare professionals from the comfort of your home via secure video calls.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl hover:shadow-card-hover transition-shadow">
              <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mb-4">
                <Bot className="h-6 w-6 text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Assistant</h3>
              <p className="text-gray-600">
                Get 24/7 health guidance from our AI assistant when doctors aren't available.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl hover:shadow-card-hover transition-shadow">
              <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Scheduling</h3>
              <p className="text-gray-600">
                Book appointments with just a few clicks and manage your healthcare calendar.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl hover:shadow-card-hover transition-shadow">
              <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-success-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-gray-600">
                Your health information is encrypted and protected with HIPAA-compliant security.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
            How TeleMed<span className="text-accent-400">AI</span> Works
          </h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
            We've designed a seamless healthcare experience for both patients and doctors.
          </p>
          
          <div className="flex justify-center mb-10">
            <div className="inline-flex rounded-md shadow-sm bg-white p-1">
              <button
                onClick={() => setSelectedTab('patients')}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedTab === 'patients'
                    ? 'bg-primary-100 text-primary-800'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                For Patients
              </button>
              <button
                onClick={() => setSelectedTab('doctors')}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedTab === 'doctors'
                    ? 'bg-secondary-100 text-secondary-800'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                For Doctors
              </button>
            </div>
          </div>
          
          {selectedTab === 'patients' ? (
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-card relative">
                <div className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center mb-4 font-semibold">1</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Your Account</h3>
                <p className="text-gray-600 mb-4">
                  Sign up, complete your health profile, and set your preferences.
                </p>
                <Link to="/register" className="text-primary-600 font-medium inline-flex items-center">
                  Register now <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-card relative">
                <div className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center mb-4 font-semibold">2</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Book Your Appointment</h3>
                <p className="text-gray-600 mb-4">
                  Choose a doctor, select a convenient time, and book instantly.
                </p>
                <Link to="/login" className="text-primary-600 font-medium inline-flex items-center">
                  See available doctors <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-card relative">
                <div className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center mb-4 font-semibold">3</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Care Anywhere</h3>
                <p className="text-gray-600 mb-4">
                  Connect via video chat with doctors or use our 24/7 AI assistant.
                </p>
                <Link to="/login" className="text-primary-600 font-medium inline-flex items-center">
                  Try it now <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-card relative">
                <div className="w-10 h-10 bg-secondary-500 text-white rounded-full flex items-center justify-center mb-4 font-semibold">1</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Join Our Network</h3>
                <p className="text-gray-600 mb-4">
                  Complete your profile with credentials, specialization, and availability.
                </p>
                <Link to="/register" className="text-secondary-600 font-medium inline-flex items-center">
                  Apply now <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-card relative">
                <div className="w-10 h-10 bg-secondary-500 text-white rounded-full flex items-center justify-center mb-4 font-semibold">2</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Manage Your Schedule</h3>
                <p className="text-gray-600 mb-4">
                  Set your availability and receive appointment bookings.
                </p>
                <Link to="/login" className="text-secondary-600 font-medium inline-flex items-center">
                  See dashboard <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-card relative">
                <div className="w-10 h-10 bg-secondary-500 text-white rounded-full flex items-center justify-center mb-4 font-semibold">3</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Treat Patients Remotely</h3>
                <p className="text-gray-600 mb-4">
                  Conduct consultations, manage records, and issue prescriptions.
                </p>
                <Link to="/login" className="text-secondary-600 font-medium inline-flex items-center">
                  Start consulting <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What Our Users Say
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <img 
                  src="https://randomuser.me/api/portraits/women/12.jpg" 
                  alt="Sarah J." 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Sarah J.</h4>
                  <p className="text-sm text-gray-600">Patient</p>
                </div>
              </div>
              <p className="text-gray-700">
                "The AI assistant helped me understand my symptoms at 2 AM when I was worried. I then scheduled a follow-up with a real doctor the next morning. Amazing service!"
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <img 
                  src="https://randomuser.me/api/portraits/men/32.jpg" 
                  alt="Dr. Michael R." 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Dr. Michael R.</h4>
                  <p className="text-sm text-gray-600">Cardiologist</p>
                </div>
              </div>
              <p className="text-gray-700">
                "As a specialist, I can now reach patients in rural areas who wouldn't normally have access to cardiology care. The platform is secure and reliable."
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <img 
                  src="https://randomuser.me/api/portraits/women/65.jpg" 
                  alt="Emily T." 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Emily T.</h4>
                  <p className="text-sm text-gray-600">Patient</p>
                </div>
              </div>
              <p className="text-gray-700">
                "Managing my chronic condition is so much easier now. I can have regular check-ins with my doctor without taking time off work. The prescription delivery is seamless too."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Experience Modern Healthcare?</h2>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto mb-8">
            Join thousands of patients and doctors who are transforming healthcare with TelemedAI.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="px-6 py-3 bg-white text-primary-600 font-medium rounded-md hover:bg-primary-50 transition-colors shadow-button"
            >
              Create Your Account
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 bg-transparent text-white font-medium rounded-md border border-white hover:bg-primary-700 transition-colors"
            >
              Log In
            </Link>
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-primary-300 mr-2" />
              <span className="text-primary-100">HIPAA Compliant</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-primary-300 mr-2" />
              <span className="text-primary-100">24/7 Support</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-primary-300 mr-2" />
              <span className="text-primary-100">Secure Encryption</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-primary-300 mr-2" />
              <span className="text-primary-100">No Hidden Fees</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center">
                <Heart className="h-6 w-6 text-primary-400" />
                <span className="ml-2 text-xl font-semibold text-white">TeleMed<span className="text-accent-400">AI</span></span>
              </div>
              <p className="mt-4 text-sm text-gray-400">
                Transforming healthcare through technology. Access quality care from anywhere, anytime.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-sm hover:text-white transition-colors">Our Doctors</a></li>
                <li><a href="#" className="text-sm hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-sm hover:text-white transition-colors">Press</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-sm hover:text-white transition-colors">FAQs</a></li>
                <li><a href="#" className="text-sm hover:text-white transition-colors">Support</a></li>
                <li><a href="#" className="text-sm hover:text-white transition-colors">For Doctors</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-sm hover:text-white transition-colors">HIPAA Compliance</a></li>
                <li><a href="#" className="text-sm hover:text-white transition-colors">Accessibility</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-6 border-t border-gray-800 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} TeleMedAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;