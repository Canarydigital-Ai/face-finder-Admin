import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import {
  ArrowLeft,
  Trash2,
  Crown,
  Building2,
  Calendar,
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Building,
  Factory,
  CreditCard,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Shield,
  Globe,
  Edit3,
  MoreVertical,
  Activity,
  Zap,
  Star,
  Settings,
  UserCheck,
  Clock4,
  Sparkles,
  TrendingUp,
  Award
} from "lucide-react";
import { MdUpdate } from "react-icons/md";
import ConfirmDialog from "../../components/dialogs/ConfirmDialog";
import "react-toastify/dist/ReactToastify.css";
import { 
  getUserById, 
  deleteUser, 
  type User 
} from "../../api/services/userService";

const UserView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUser(id);
    }
  }, [id]);

  const fetchUser = async (userId: string) => {
    setLoading(true);
    try {
      const userData = await getUserById(userId);
      if (userData) {
        setUser(userData);
      } else {
        toast.error("User not found");
        navigate("/admin/users");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Failed to fetch user details");
      navigate("/admin/users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      const result = await deleteUser(id);
      if (result.success) {
        toast.success("User deleted successfully!");
        navigate("/admin/users");
      } else {
        toast.error(result.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete user. Please try again.");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return "Not available";
    
    try {
      let dateObj;
      
      // Handle Firebase Timestamp objects
      if (date.seconds) {
        dateObj = new Date(date.seconds * 1000);
      } 
      // Handle string dates
      else if (typeof date === 'string') {
        dateObj = new Date(date);
      }
      // Handle Date objects
      else if (date instanceof Date) {
        dateObj = date;
      }
      else {
        return "Invalid date";
      }
      
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        return "Invalid date";
      }
      
      return dateObj.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return "Invalid date";
    }
  };

  const getSubscriptionStatus = (expiresAt: string) => {
    if (!expiresAt || expiresAt.trim() === '') {
      return {
        isExpired: true,
        daysLeft: 0,
        status: 'No Subscription'
      };
    }
    
    try {
      const expiryDate = new Date(expiresAt);
      const now = new Date();
      
      // Check if date is valid
      if (isNaN(expiryDate.getTime())) {
        return {
          isExpired: true,
          daysLeft: 0,
          status: 'Invalid Date'
        };
      }
      
      const isExpired = expiryDate < now;
      const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        isExpired,
        daysLeft: Math.max(0, daysLeft), // Ensure non-negative days
        status: isExpired ? 'Expired' : daysLeft <= 7 ? 'Expiring Soon' : 'Active'
      };
    } catch (error) {
      console.error('Error parsing expiry date:', error);
      return {
        isExpired: true,
        daysLeft: 0,
        status: 'Invalid Date'
      };
    }
  };

  const getCountryName = (countryCode: string) => {
    const countries: { [key: string]: string } = {
      'IN': 'India',
      'US': 'United States',
      'GB': 'United Kingdom',
      'CA': 'Canada',
    };
    return countries[countryCode] || countryCode;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-blue-400 rounded-full animate-ping mx-auto"></div>
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800">Loading User Profile</h3>
            <p className="text-gray-500 mt-2">Please wait while we fetch the details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">User Not Found</h3>
          <p className="text-gray-500 mb-6">The requested user profile could not be located.</p>
          <button
            onClick={() => navigate("/admin/users")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  const subscriptionStatus = user?.subscription?.expires_at ? getSubscriptionStatus(user.subscription.expires_at) : {
    isExpired: true,
    daysLeft: 0,
    status: 'No Subscription'
  };
  const daysActive = user?.createdAt ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <ToastContainer />
      
      {/* Enhanced Header */}
      <div className=" border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/admin/users")}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="font-medium">Back to Users</span>
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                  <UserCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">User Profile</h1>
                  <p className="text-sm text-gray-500">Detailed user information</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                <MoreVertical className="w-5 h-5" />
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <button
                onClick={() => setIsDeleteDialogOpen(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Trash2 className="w-4 h-4" />
                <span className="font-medium">Delete User</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Enhanced Profile Card */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              {/* Profile Header with Gradient */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 px-6 py-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10"></div>
                
                <div className="relative text-center text-white">
                  <div className="relative inline-block mb-4">
                    <div className="w-24 h-24 rounded-full p-1 bg-white/20 backdrop-blur-sm">
                      <img
                        src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=128`}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=128`;
                        }}
                      />
                    </div>
                    {user.provider === 'google.com' && (
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg">
                        <Globe className="w-4 h-4 text-red-500" />
                      </div>
                    )}
                  </div>
                  
                  <h2 className="text-xl font-bold mb-1">{user.name}</h2>
                  <p className="text-blue-100 text-sm font-mono bg-white/10 px-3 py-1 rounded-full inline-block">
                    {user.uid.slice(0, 8)}...
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="px-6 py-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="flex items-center justify-center mb-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-blue-700">{daysActive}</p>
                    <p className="text-xs text-blue-600 font-medium">Days Active</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <div className="flex items-center justify-center mb-2">
                      <Clock4 className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-700">
                      {subscriptionStatus.daysLeft || 0}
                    </p>
                    <p className="text-xs text-green-600 font-medium">Days Left</p>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Account Status</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-green-700">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span>Quick Actions</span>
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-blue-50 rounded-lg transition-colors duration-200 group">
                  <Edit3 className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-sm font-medium text-gray-700">Edit Profile</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-purple-50 rounded-lg transition-colors duration-200 group">
                  <Shield className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-sm font-medium text-gray-700">Security Settings</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-green-50 rounded-lg transition-colors duration-200 group">
                  <TrendingUp className="w-4 h-4 text-green-600 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-sm font-medium text-gray-700">View Analytics</span>
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Details Section */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                    <UserCheck className="w-5 h-5 text-white" />
                  </div>
                  <span>Contact Information</span>
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-600 font-medium">Verified</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl group-hover:from-blue-50 group-hover:to-indigo-50 transition-all duration-200">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-200">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Email Address</p>
                      <p className="font-medium text-gray-900 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="group">
                  <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl group-hover:from-green-50 group-hover:to-emerald-50 transition-all duration-200">
                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-200">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Phone Number</p>
                      <p className="font-medium text-gray-900">
                        {user.phoneNumber && user.phoneNumber.trim() !== '' ? user.phoneNumber : 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="group md:col-span-2">
                  <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl group-hover:from-purple-50 group-hover:to-pink-50 transition-all duration-200">
                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors duration-200">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Location</p>
                      <p className="font-medium text-gray-900">
                        {(() => {
                          const locationParts = [user.city, user.state, getCountryName(user.country)]
                            .filter(part => part && part.trim() !== '');
                          return locationParts.length > 0 ? locationParts.join(', ') : 'Not provided';
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <span>Professional Information</span>
                </h3>
                <Award className="w-6 h-6 text-yellow-500" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl group-hover:from-blue-50 group-hover:to-indigo-50 transition-all duration-200">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-200">
                      <Building className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Company</p>
                      <p className="font-medium text-gray-900">
                        {user.companyName && user.companyName.trim() !== '' ? user.companyName : 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="group">
                  <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl group-hover:from-orange-50 group-hover:to-red-50 transition-all duration-200">
                    <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors duration-200">
                      <Factory className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Industry</p>
                      <p className="font-medium text-gray-900">
                        {user.industry && user.industry.trim() !== '' ? user.industry : 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {user.industryAreas && user.industryAreas.length > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Expertise Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {user.industryAreas.map((area, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <Sparkles className="w-3 h-3 inline mr-1" />
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Subscription Information */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
              <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-700 px-8 py-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
                
                <div className="relative flex items-center justify-between text-white">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Subscription Details</h3>
                      <p className="text-purple-100">Premium membership information</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {user.subscription.planName === 'Pro' && <Crown className="w-6 h-6 text-yellow-300" />}
                    {user.subscription.planName === 'Basic' && <Star className="w-6 h-6 text-orange-300" />}
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      {user.subscription.planName === 'Pro' && (
                        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                          <Crown className="w-5 h-5 text-white" />
                        </div>
                      )}
                      {user.subscription.planName === 'Basic' && (
                        <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
                          <Star className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div>
                        <span className="text-2xl font-bold text-gray-900">{user.subscription.planName}</span>
                        <span className="ml-3 px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                          {user.subscription.billing}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {subscriptionStatus.status === 'Active' && (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                          Active
                        </span>
                      </>
                    )}
                    {subscriptionStatus.status === 'Expiring Soon' && (
                      <>
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                          Expiring Soon
                        </span>
                      </>
                    )}
                    {subscriptionStatus.status === 'Expired' && (
                      <>
                        <XCircle className="w-5 h-5 text-red-500" />
                        <span className="px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                          Expired
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl group-hover:from-green-50 group-hover:to-emerald-50 transition-all duration-200">
                      <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-200">
                        <Calendar className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Activated On</p>
                        <p className="font-medium text-gray-900">{user.subscription.activatedAt}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group">
                    <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-red-50 rounded-xl group-hover:from-red-50 group-hover:to-pink-50 transition-all duration-200">
                      <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors duration-200">
                        <Clock className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Expires On</p>
                        <p className="font-medium text-gray-900">{user.subscription.expires_at}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {!subscriptionStatus.isExpired && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-blue-900">
                          {subscriptionStatus.daysLeft > 1 
                            ? `${subscriptionStatus.daysLeft} days remaining`
                            : subscriptionStatus.daysLeft === 1
                            ? "1 day remaining"
                            : "Expires today"
                          }
                        </p>
                        <p className="text-sm text-blue-700 mt-1">Your subscription is active and in good standing</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Account Timeline */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <span>Account Timeline</span>
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock4 className="w-4 h-4" />
                  <span>Activity History</span>
                </div>
              </div>
              
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-400 via-blue-400 to-gray-300"></div>
                
                <div className="space-y-8">
                  {/* Account Created */}
                  <div className="relative flex items-start space-x-6">
                    <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg">
                      <UserCheck className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0 pb-8">
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">Account Created</h4>
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full uppercase tracking-wide">
                            Milestone
                          </span>
                        </div>
                        <p className="text-green-700 font-medium">{formatDate(user.createdAt)}</p>
                        <p className="text-sm text-green-600 mt-1">Welcome to our platform! Account successfully registered.</p>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Activated */}
                  <div className="relative flex items-start space-x-6">
                    <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0 pb-8">
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">Subscription Activated</h4>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full uppercase tracking-wide">
                            Premium
                          </span>
                        </div>
                        <p className="text-blue-700 font-medium">{user.subscription.activatedAt}</p>
                        <p className="text-sm text-blue-600 mt-1">Upgraded to {user.subscription.planName} plan with full access.</p>
                      </div>
                    </div>
                  </div>

                  {/* Last Updated */}
                  <div className="relative flex items-start space-x-6">
                    <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full shadow-lg">
                      <MdUpdate className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">Last Profile Update</h4>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full uppercase tracking-wide">
                            Recent
                          </span>
                        </div>
                        <p className="text-gray-700 font-medium">{formatDate(user.updatedAt)}</p>
                        <p className="text-sm text-gray-600 mt-1">Profile information was last modified.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Stats Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span>Account Statistics</span>
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-blue-600 font-medium">Live Data</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200">
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">{daysActive}</p>
                  <p className="text-xs text-blue-600 font-medium">Total Days</p>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:from-green-100 hover:to-emerald-100 transition-all duration-200">
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-green-700">100%</p>
                  <p className="text-xs text-green-600 font-medium">Profile Complete</p>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:from-purple-100 hover:to-pink-100 transition-all duration-200">
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Star className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-purple-700">{user.subscription.planName}</p>
                  <p className="text-xs text-purple-600 font-medium">Plan Type</p>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100 hover:from-orange-100 hover:to-red-100 transition-all duration-200">
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Shield className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-orange-700">A+</p>
                  <p className="text-xs text-orange-600 font-medium">Security Score</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete ${user.name}'s account? This action cannot be undone and will remove all associated data, subscription information, and user preferences.`}
      />
    </div>
  );
};

export default UserView;