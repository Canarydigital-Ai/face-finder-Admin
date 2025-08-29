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
  MoreVertical,
  Activity,
  Star,
  Settings,
  UserCheck,
  Clock4,
  Sparkles,
  TrendingUp,
  Award,
  Timer
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
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute for live countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

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
        hoursLeft: 0,
        minutesLeft: 0,
        status: 'No Subscription',
        timeRemaining: 'No active subscription'
      };
    }

    try {
      // Handle Firebase date format: "September 28, 2025 at 03:11:54 PM UTC+5:30"
      console.log('Raw expiry date from Firebase:', expiresAt);

      // Parse the date manually to avoid timezone issues
      const dateMatch = expiresAt.match(/(\w+)\s+(\d{1,2}),\s+(\d{4})\s+at\s+(\d{1,2}):(\d{2}):(\d{2})\s+(AM|PM)/);

      if (!dateMatch) {
        console.error('Date format does not match expected pattern:', expiresAt);
        return {
          isExpired: true,
          daysLeft: 0,
          hoursLeft: 0,
          minutesLeft: 0,
          status: 'Invalid Format',
          timeRemaining: 'Invalid date format'
        };
      }

      const [, month, day, year, hour, minute, second, ampm] = dateMatch;

      const months = {
        'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
        'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
      };

      let hour24 = parseInt(hour);
      if (ampm === 'PM' && hour24 !== 12) hour24 += 12;
      if (ampm === 'AM' && hour24 === 12) hour24 = 0;

      const expiryDate = new Date(
        parseInt(year),
        months[month as keyof typeof months],
        parseInt(day),
        hour24,
        parseInt(minute),
        parseInt(second)
      );

      const now = new Date(); // Use actual current time, not state

      console.log('Manually parsed expiry date:', expiryDate);
      console.log('Current date and time:', now);
      console.log('Expiry timestamp:', expiryDate.getTime());
      console.log('Current timestamp:', now.getTime());

      const timeDiff = expiryDate.getTime() - now.getTime();
      const isExpired = timeDiff <= 0;

      console.log('Time difference (ms):', timeDiff);
      console.log('Time difference (days):', timeDiff / (1000 * 60 * 60 * 24));
      console.log('Is expired:', isExpired);

      if (isExpired) {
        const expiredTime = Math.abs(timeDiff);
        const expiredDays = Math.floor(expiredTime / (1000 * 60 * 60 * 24));
        return {
          isExpired: true,
          daysLeft: 0,
          hoursLeft: 0,
          minutesLeft: 0,
          status: 'Expired',
          timeRemaining: `Expired ${expiredDays} day${expiredDays !== 1 ? 's' : ''} ago`
        };
      }

      const daysLeft = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hoursLeft = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

      console.log('Final calculation - Days:', daysLeft, 'Hours:', hoursLeft, 'Minutes:', minutesLeft);

      // Create formatted time remaining string
      let timeRemaining = '';
      if (daysLeft > 0) {
        timeRemaining = `${daysLeft}d ${hoursLeft}h`;
      } else if (hoursLeft > 0) {
        timeRemaining = `${hoursLeft}h ${minutesLeft}m`;
      } else {
        timeRemaining = `${minutesLeft}m`;
      }

      return {
        isExpired: false,
        daysLeft: Math.max(0, daysLeft),
        hoursLeft: Math.max(0, hoursLeft),
        minutesLeft: Math.max(0, minutesLeft),
        status: daysLeft <= 7 ? 'Expiring Soon' : 'Active',
        timeRemaining
      };
    } catch (error) {
      console.error('Error in getSubscriptionStatus:', error);
      return {
        isExpired: true,
        daysLeft: 0,
        hoursLeft: 0,
        minutesLeft: 0,
        status: 'Parse Error',
        timeRemaining: 'Error calculating expiry'
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-800 border-t-[#FFD426] rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-yellow-400 rounded-full animate-ping mx-auto"></div>
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-[#FFD426]">Loading User Profile</h3>
            <p className="text-gray-400 mt-2">Please wait while we fetch the details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-red-900/30 border border-red-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-[#FFD426] mb-2">User Not Found</h3>
          <p className="text-gray-400 mb-6">The requested user profile could not be located.</p>
          <button
            onClick={() => navigate("/admin/users")}
            className="bg-[#FFD426] text-black px-6 py-3 rounded-lg hover:bg-yellow-300 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
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
    hoursLeft: 0,
    minutesLeft: 0,
    status: 'No Subscription',
    timeRemaining: 'No active subscription'
  };
  const daysActive = user?.createdAt ? Math.floor((currentTime.getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="min-h-screen bg-black">
      <ToastContainer />

      {/* Enhanced Header */}
      <div className="border-b border-gray-800 sticky top-0 z-40 backdrop-blur-sm bg-black/95">
        <div className=" px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/admin/users")}
                className="flex items-center space-x-2 text-gray-400 hover:text-[#FFD426] transition-colors duration-200 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="font-medium">Back to Users</span>
              </button>
              <div className="h-6 w-px bg-gray-700" />
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#FFD426] rounded-lg">
                  <UserCircle className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#FFD426]">User Profile</h1>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-[#FFD426] hover:bg-gray-800 rounded-lg transition-colors duration-200">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-[#FFD426] hover:bg-gray-800 rounded-lg transition-colors duration-200">
                <MoreVertical className="w-5 h-5" />
              </button>
              <div className="h-6 w-px bg-gray-700" />
              <button
                onClick={() => setIsDeleteDialogOpen(true)}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Trash2 className="w-4 h-4" />
                <span className="font-medium">Delete User</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-6">

          {/* Enhanced Profile Card */}
          <div className="lg:col-span-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden h-full">
              {/* Profile Header with Black/Yellow Gradient */}
              <div className="bg-gradient-to-r from-black via-gray-900 to-black border-b-2 border-[#FFD426] px-6 py-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#FFD426]/5 via-transparent to-[#FFD426]/5"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD426]/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#FFD426]/5 rounded-full translate-y-10 -translate-x-10"></div>

                <div className="relative text-center">
                  <div className="relative inline-block mb-4">
                    <div className="w-24 h-24 rounded-full p-1 bg-[#FFD426]/20 backdrop-blur-sm border-2 border-[#FFD426]/30">
                      <img
                        src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=FFD426&color=000000&size=128`}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=FFD426&color=000000&size=128`;
                        }}
                      />
                    </div>
                    {user.provider === 'google.com' && (
                      <div className="absolute -bottom-1 -right-1 bg-[#FFD426] rounded-full p-1.5 shadow-lg">
                        <Globe className="w-4 h-4 text-black" />
                      </div>
                    )}
                  </div>

                  <h2 className="text-xl font-bold mb-1 text-[#FFD426]">{user.name}</h2>
                  <p className="text-gray-300 text-sm font-mono bg-gray-800/50 px-3 py-1 rounded-full inline-block border border-gray-700">
                    {user.uid.slice(0, 8)}...
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="px-6 py-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-800 border border-gray-700 rounded-xl">
                    <div className="flex items-center justify-center mb-2">
                      <Activity className="w-5 h-5 text-[#FFD426]" />
                    </div>
                    <p className="text-2xl font-bold text-[#FFD426]">{daysActive}</p>
                    <p className="text-xs text-gray-400 font-medium">Days Active</p>
                  </div>
                  <div className="text-center p-4 bg-gray-800 border border-gray-700 rounded-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FFD426]/10 to-transparent"></div>
                    <div className="relative">
                      <div className="flex items-center justify-center mb-2">
                        <div className={`p-1 rounded-full ${subscriptionStatus.isExpired ? 'bg-red-900' : subscriptionStatus.daysLeft <= 7 ? 'bg-yellow-900' : 'bg-gray-700'} animate-pulse`}>
                          <Timer className={`w-4 h-4 ${subscriptionStatus.isExpired ? 'text-red-400' : subscriptionStatus.daysLeft <= 7 ? 'text-[#FFD426]' : 'text-green-400'}`} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        {subscriptionStatus.isExpired ? (
                          <>
                            <p className="text-2xl font-bold text-red-400">
                              EXPIRED
                            </p>
                            <p className="text-xs text-red-400 font-medium">Subscription Ended</p>
                          </>
                        ) : subscriptionStatus.daysLeft === 0 ? (
                          <>
                            <p className="text-2xl font-bold text-[#FFD426]">
                              TODAY
                            </p>
                            <p className="text-xs text-[#FFD426] font-medium">Expires Today</p>
                            <div className="text-xs text-gray-300 font-mono bg-gray-800 px-2 py-1 rounded-full border border-gray-700">
                              {subscriptionStatus.hoursLeft}h {subscriptionStatus.minutesLeft}m left
                            </div>
                          </>
                        ) : (
                          <>
                            <p className={`text-2xl font-bold ${subscriptionStatus.daysLeft <= 7 ? 'text-[#FFD426]' : 'text-green-400'}`}>
                              {subscriptionStatus.daysLeft}
                            </p>
                            <p className={`text-xs font-medium ${subscriptionStatus.daysLeft <= 7 ? 'text-[#FFD426]' : 'text-green-400'}`}>
                              {subscriptionStatus.daysLeft === 1 ? 'Day Left' : 'Days Left'}
                            </p>
                            <div className={`text-xs font-mono px-2 py-1 rounded-full border ${subscriptionStatus.daysLeft <= 7 ? 'text-[#FFD426] bg-yellow-900/20 border-yellow-800' : 'text-green-400 bg-green-900/20 border-green-800'}`}>
                              {subscriptionStatus.timeRemaining}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="mt-6 p-4 bg-gray-800 border border-gray-700 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300">Account Status</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[#FFD426] rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-[#FFD426]">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Details Section */}
          <div className="lg:col-span-8 space-y-6"> 
            {/* Contact Information */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 hover:border-[#FFD426]/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#FFD426] flex items-center space-x-3">
                  <div className="p-2 bg-[#FFD426] rounded-lg">
                    <UserCheck className="w-5 h-5 text-black" />
                  </div>
                  <span>Contact Information</span>
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-400 font-medium">Verified</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <div className="flex items-start space-x-4 p-4 bg-gray-800 border border-gray-700 rounded-xl group-hover:border-[#FFD426]/30 transition-all duration-200">
                    <div className="p-2 bg-gray-700 rounded-lg group-hover:bg-[#FFD426] group-hover:text-black transition-colors duration-200">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Email Address</p>
                      <p className="font-medium text-gray-100 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>

                <div className="group">
                  <div className="flex items-start space-x-4 p-4 bg-gray-800 border border-gray-700 rounded-xl group-hover:border-[#FFD426]/30 transition-all duration-200">
                    <div className="p-2 bg-gray-700 rounded-lg group-hover:bg-[#FFD426] group-hover:text-black transition-colors duration-200">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Phone Number</p>
                      <p className="font-medium text-gray-100">
                        {user.phoneNumber && user.phoneNumber.trim() !== '' ? user.phoneNumber : 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group md:col-span-2">
                  <div className="flex items-start space-x-4 p-4 bg-gray-800 border border-gray-700 rounded-xl group-hover:border-[#FFD426]/30 transition-all duration-200">
                    <div className="p-2 bg-gray-700 rounded-lg group-hover:bg-[#FFD426] group-hover:text-black transition-colors duration-200">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Location</p>
                      <p className="font-medium text-gray-100">
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
            <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 hover:border-[#FFD426]/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#FFD426] flex items-center space-x-3">
                  <div className="p-2 bg-[#FFD426] rounded-lg">
                    <Building2 className="w-5 h-5 text-black" />
                  </div>
                  <span>Professional Information</span>
                </h3>
                <Award className="w-6 h-6 text-[#FFD426]" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <div className="flex items-start space-x-4 p-4 bg-gray-800 border border-gray-700 rounded-xl group-hover:border-[#FFD426]/30 transition-all duration-200">
                    <div className="p-2 bg-gray-700 rounded-lg group-hover:bg-[#FFD426] group-hover:text-black transition-colors duration-200">
                      <Building className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Company</p>
                      <p className="font-medium text-gray-100">
                        {user.companyName && user.companyName.trim() !== '' ? user.companyName : 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group">
                  <div className="flex items-start space-x-4 p-4 bg-gray-800 border border-gray-700 rounded-xl group-hover:border-[#FFD426]/30 transition-all duration-200">
                    <div className="p-2 bg-gray-700 rounded-lg group-hover:bg-[#FFD426] group-hover:text-black transition-colors duration-200">
                      <Factory className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Industry</p>
                      <p className="font-medium text-gray-100">
                        {user.industry && user.industry.trim() !== '' ? user.industry : 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {user.industryAreas && user.industryAreas.length > 0 && (
                <div className="mt-6 p-4 bg-gray-800 border border-gray-700 rounded-xl">
                  <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Expertise Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {user.industryAreas.map((area, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-[#FFD426] text-black text-sm font-medium rounded-full shadow-lg hover:bg-yellow-300 transform hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <Sparkles className="w-3 h-3 inline mr-1" />
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div> 
          </div> 
        </div>

        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

            <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden hover:border-[#FFD426]/30 transition-all duration-300">
              <div className="bg-gradient-to-r from-black via-gray-900 to-black border-b-2 border-[#FFD426] px-8 py-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#FFD426]/5 via-transparent to-[#FFD426]/5"></div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFD426]/10 rounded-full -translate-y-12 translate-x-12"></div>

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-[#FFD426]/20 backdrop-blur-sm rounded-xl border border-[#FFD426]/30">
                      <CreditCard className="w-6 h-6 text-[#FFD426]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#FFD426]">Subscription Details</h3>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {user.subscription.planName === 'Pro' && <Crown className="w-6 h-6 text-[#FFD426]" />}
                    {user.subscription.planName === 'Basic' && <Star className="w-6 h-6 text-[#FFD426]" />}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-gray-900">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      {user.subscription.planName === 'Pro' && (
                        <div className="p-2 bg-[#FFD426] rounded-lg">
                          <Crown className="w-5 h-5 text-black" />
                        </div>
                      )}
                      {user.subscription.planName === 'Basic' && (
                        <div className="p-2 bg-[#FFD426] rounded-lg">
                          <Star className="w-5 h-5 text-black" />
                        </div>
                      )}
                      <div>
                        <span className="text-2xl font-bold text-[#FFD426]">{user.subscription.planName}</span>
                        <span className="ml-3 px-3 py-1 bg-gray-800 text-gray-300 text-sm font-medium rounded-full border border-gray-700">
                          {user.subscription.billing}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {subscriptionStatus.status === 'Active' && (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="px-4 py-2 bg-green-900/20 text-green-400 border border-green-800 rounded-full text-sm font-semibold">
                          Active
                        </span>
                      </>
                    )}
                    {subscriptionStatus.status === 'Expiring Soon' && (
                      <>
                        <AlertTriangle className="w-5 h-5 text-[#FFD426]" />
                        <span className="px-4 py-2 bg-yellow-900/20 text-[#FFD426] border border-yellow-800 rounded-full text-sm font-semibold">
                          Expiring Soon
                        </span>
                      </>
                    )}
                    {subscriptionStatus.status === 'Expired' && (
                      <>
                        <XCircle className="w-5 h-5 text-red-400" />
                        <span className="px-4 py-2 bg-red-900/20 text-red-400 border border-red-800 rounded-full text-sm font-semibold">
                          Expired
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <div className="flex items-start space-x-4 p-4 bg-gray-800 border border-gray-700 rounded-xl group-hover:border-[#FFD426]/30 transition-all duration-200">
                      <div className="p-2 bg-gray-700 rounded-lg group-hover:bg-[#FFD426] group-hover:text-black transition-colors duration-200">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Activated On</p>
                        <p className="font-medium text-gray-100">{user.subscription.activatedAt}</p>
                      </div>
                    </div>
                  </div>

                  <div className="group">
                    <div className="flex items-start space-x-4 p-4 bg-gray-800 border border-gray-700 rounded-xl group-hover:border-[#FFD426]/30 transition-all duration-200">
                      <div className="p-2 bg-gray-700 rounded-lg group-hover:bg-[#FFD426] group-hover:text-black transition-colors duration-200">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Expires On</p>
                        <p className="font-medium text-gray-100">{user.subscription.expires_at}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {!subscriptionStatus.isExpired && (
                  <div className="mt-6 p-6 bg-gray-800 border border-gray-700 rounded-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FFD426]/5 to-transparent"></div>
                    <div className="relative">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-[#FFD426] rounded-lg">
                          <Timer className="w-5 h-5 text-black" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#FFD426]">Live Countdown</p>
                          <p className="text-sm text-gray-400 mt-1">Subscription expires in real-time</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="text-center p-3 bg-gray-700 border border-gray-600 rounded-lg">
                          <p className="text-xl font-bold text-[#FFD426]">{subscriptionStatus.daysLeft}</p>
                          <p className="text-xs text-gray-400 font-medium">Days</p>
                        </div>
                        <div className="text-center p-3 bg-gray-700 border border-gray-600 rounded-lg">
                          <p className="text-xl font-bold text-[#FFD426]">{subscriptionStatus.hoursLeft}</p>
                          <p className="text-xs text-gray-400 font-medium">Hours</p>
                        </div>
                        <div className="text-center p-3 bg-gray-700 border border-gray-600 rounded-lg">
                          <p className="text-xl font-bold text-[#FFD426]">{subscriptionStatus.minutesLeft}</p>
                          <p className="text-xs text-gray-400 font-medium">Minutes</p>
                        </div>
                      </div>

                      <div className="mt-4 text-center">
                        <span className="inline-flex items-center space-x-2 px-4 py-2 bg-[#FFD426] text-black rounded-full text-sm font-semibold">
                          <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                          <span>{subscriptionStatus.timeRemaining} remaining</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {subscriptionStatus.isExpired && (
                  <div className="mt-6 p-6 bg-red-900/20 border border-red-800 rounded-xl">
                    <div className="flex items-center space-x-3 text-red-400">
                      <XCircle className="w-6 h-6" />
                      <div>
                        <p className="font-semibold">Subscription Expired</p>
                        <p className="text-sm text-red-400 mt-1">{subscriptionStatus.timeRemaining}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Account Timeline */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 hover:border-[#FFD426]/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#FFD426] flex items-center space-x-3">
                  <div className="p-2 bg-[#FFD426] rounded-lg">
                    <Calendar className="w-5 h-5 text-black" />
                  </div>
                  <span>Account Timeline</span>
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Clock4 className="w-4 h-4" />
                  <span>Activity History</span>
                </div>
              </div>

              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#FFD426] via-gray-600 to-gray-700"></div>

                <div className="space-y-8">
                  {/* Account Created */}
                  <div className="relative flex items-start space-x-6">
                    <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-[#FFD426] rounded-full shadow-lg border-2 border-black">
                      <UserCheck className="w-6 h-6 text-black" />
                    </div>
                    <div className="flex-1 min-w-0 pb-8">
                      <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl hover:border-[#FFD426]/30 transition-all duration-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-semibold text-[#FFD426]">Account Created</h4>
                          <span className="px-3 py-1 bg-[#FFD426]/20 text-[#FFD426] text-xs font-semibold rounded-full uppercase tracking-wide border border-[#FFD426]/30">
                            Milestone
                          </span>
                        </div>
                        <p className="text-gray-100 font-medium">{formatDate(user.createdAt)}</p>
                        <p className="text-sm text-gray-400 mt-1">Welcome to our platform! Account successfully registered.</p>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Activated */}
                  <div className="relative flex items-start space-x-6">
                    <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-gray-700 border-2 border-[#FFD426] rounded-full shadow-lg">
                      <Crown className="w-6 h-6 text-[#FFD426]" />
                    </div>
                    <div className="flex-1 min-w-0 pb-8">
                      <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl hover:border-[#FFD426]/30 transition-all duration-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-semibold text-[#FFD426]">Subscription Activated</h4>
                          <span className="px-3 py-1 bg-[#FFD426] text-black text-xs font-semibold rounded-full uppercase tracking-wide">
                            Premium
                          </span>
                        </div>
                        <p className="text-gray-100 font-medium">{user.subscription.activatedAt}</p>
                        <p className="text-sm text-gray-400 mt-1">Upgraded to {user.subscription.planName} plan with full access.</p>
                      </div>
                    </div>
                  </div>

                  {/* Last Updated */}
                  <div className="relative flex items-start space-x-6">
                    <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-gray-600 rounded-full shadow-lg border-2 border-gray-500">
                      <MdUpdate className="w-6 h-6 text-gray-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl hover:border-[#FFD426]/30 transition-all duration-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-semibold text-gray-300">Last Profile Update</h4>
                          <span className="px-3 py-1 bg-gray-700 text-gray-300 text-xs font-semibold rounded-full uppercase tracking-wide border border-gray-600">
                            Recent
                          </span>
                        </div>
                        <p className="text-gray-100 font-medium">{formatDate(user.updatedAt)}</p>
                        <p className="text-sm text-gray-400 mt-1">Profile information was last modified.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>  
          </div> 

          {/* Additional Stats Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 hover:border-[#FFD426]/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#FFD426] flex items-center space-x-3">
                <div className="p-2 bg-[#FFD426] rounded-lg">
                  <TrendingUp className="w-5 h-5 text-black" />
                </div>
                <span>Account Statistics</span>
              </h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#FFD426] rounded-full animate-pulse"></div>
                <span className="text-sm text-[#FFD426] font-medium">Live Data</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-800 border border-gray-700 rounded-xl hover:border-[#FFD426]/30 transition-all duration-200">
                <div className="flex items-center justify-center mb-3">
                  <div className="p-2 bg-gray-700 rounded-lg">
                    <Activity className="w-5 h-5 text-[#FFD426]" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#FFD426]">{daysActive}</p>
                <p className="text-xs text-gray-400 font-medium">Total Days</p>
              </div>

              <div className="text-center p-4 bg-gray-800 border border-gray-700 rounded-xl hover:border-[#FFD426]/30 transition-all duration-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#FFD426]/10 to-transparent"></div>
                <div className="relative">
                  <div className="flex items-center justify-center mb-3">
                    <div className={`p-2 rounded-lg ${subscriptionStatus.isExpired ? 'bg-red-900' : 'bg-gray-700'}`}>
                      <Timer className={`w-5 h-5 ${subscriptionStatus.isExpired ? 'text-red-400' : 'text-[#FFD426]'}`} />
                    </div>
                  </div>
                  <p className={`text-2xl font-bold ${subscriptionStatus.isExpired ? 'text-red-400' : 'text-[#FFD426]'}`}>
                    100%
                  </p>
                  <p className="text-xs text-gray-400 font-medium">Profile Complete</p>
                  {!subscriptionStatus.isExpired && (
                    <div className="mt-2 text-xs text-[#FFD426] font-mono bg-gray-700 px-2 py-1 rounded-full border border-gray-600">
                      Live: {subscriptionStatus.timeRemaining}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center p-4 bg-gray-800 border border-gray-700 rounded-xl hover:border-[#FFD426]/30 transition-all duration-200">
                <div className="flex items-center justify-center mb-3">
                  <div className="p-2 bg-gray-700 rounded-lg">
                    <Star className="w-5 h-5 text-[#FFD426]" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#FFD426]">{user.subscription.planName}</p>
                <p className="text-xs text-gray-400 font-medium">Plan Type</p>
              </div>

              <div className="text-center p-4 bg-gray-800 border border-gray-700 rounded-xl hover:border-[#FFD426]/30 transition-all duration-200">
                <div className="flex items-center justify-center mb-3">
                  <div className="p-2 bg-gray-700 rounded-lg">
                    <Shield className="w-5 h-5 text-[#FFD426]" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#FFD426]">A+</p>
                <p className="text-xs text-gray-400 font-medium">Security Score</p>
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