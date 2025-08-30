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
  Timer,
  Camera,
  Image,
  Eye,
  EyeOff,
  FileText
} from "lucide-react";
import { MdUpdate } from "react-icons/md";
import ConfirmDialog from "../../components/dialogs/ConfirmDialog";
import "react-toastify/dist/ReactToastify.css";
import {
  getUserById,
  deleteUser,
  type User
} from "../../api/services/userService";
import {
  getEventsByUserId,
  type Event
} from "../../api/services/eventService";

// User Profile Component
const UserProfileTab: React.FC<{ user: User; subscriptionStatus: any; daysActive: number; currentTime: Date; formatDate: (date: any) => string }> = ({
  user,
  subscriptionStatus,
  daysActive,
}) => {
  return (
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
                        <p className="text-2xl font-bold text-red-400">EXPIRED</p>
                        <p className="text-xs text-red-400 font-medium">Subscription Ended</p>
                      </>
                    ) : subscriptionStatus.daysLeft === 0 ? (
                      <>
                        <p className="text-2xl font-bold text-[#FFD426]">TODAY</p>
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
                      const getCountryName = (countryCode: string) => {
                        const countries: { [key: string]: string } = {
                          'IN': 'India',
                          'US': 'United States',
                          'GB': 'United Kingdom',
                          'CA': 'Canada',
                        };
                        return countries[countryCode] || countryCode;
                      };
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
  );
};

// User Events Component
const UserEventsTab: React.FC<{ userId: string; formatDate: (date: any) => string }> = ({ userId, formatDate }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserEvents();
  }, [userId]);

  const fetchUserEvents = async () => {
    setLoading(true);
    try {
      const userEvents = await getEventsByUserId(userId);
      setEvents(userEvents);
    } catch (error) {
      console.error("Error fetching user events:", error);
      toast.error("Failed to fetch user events");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-gray-800 border-t-[#FFD426] rounded-full animate-spin mx-auto"></div>
          </div>
          <p className="text-gray-400 mt-4">Loading user events...</p>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <Camera className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-300 mb-2">No Events Found</h3>
        <p className="text-gray-400">This user hasn't created any events yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Events Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#FFD426] rounded-lg">
            <Camera className="w-5 h-5 text-black" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#FFD426]">User Events</h3>
            <p className="text-sm text-gray-400">{events.length} event{events.length !== 1 ? 's' : ''} found</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1 bg-gray-800 border border-gray-700 rounded-full">
          <Activity className="w-4 h-4 text-[#FFD426]" />
          <span className="text-sm font-medium text-[#FFD426]">Total: {events.length}</span>
        </div>
      </div>

     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {events.map((event) => {
    // Calculate total size of all images
    const totalSize = event.uploaded_images?.reduce((total, image) => {
      const sizeMatch = image.image_size.match(/(\d+\.?\d*)\s*KB/);
      const sizeInKB = sizeMatch ? parseFloat(sizeMatch[1]) : 0;
      return total + sizeInKB;
    }, 0) || 0;
    
    // Calculate average image size
    const averageSize = event.uploaded_images?.length > 0 
      ? totalSize / event.uploaded_images.length 
      : 0;
    
    // Format the size for display
    const formatSize = (kb:any) => {
      if (kb >= 1024) {
        return (kb / 1024).toFixed(1) + ' MB';
      }
      return Math.round(kb) + ' KB';
    };

    return (
      <div
        key={event.id}
        className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden hover:border-[#FFD426]/30 transition-all duration-300 group"
      >
        {/* Event Cover Image */}
        <div className="relative h-48 bg-gray-800 overflow-hidden">
          {event.coverImage ? (
            <img
              src={event.coverImage}
              alt={event.eventName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`${event.coverImage ? 'hidden' : ''} w-full h-full flex items-center justify-center bg-gray-800`}>
            <Image className="w-12 h-12 text-gray-600" />
          </div>
          
          {/* Event Type Badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-[#FFD426] text-black text-xs font-semibold rounded-full">
              {event.eventType}
            </span>
          </div>

          {/* Public/Private Badge */}
          <div className="absolute top-3 right-3">
            <div className={`p-1.5 rounded-full ${event.isPublic ? 'bg-green-500' : 'bg-gray-600'}`}>
              {event.isPublic ? (
                <Eye className="w-3 h-3 text-white" />
              ) : (
                <EyeOff className="w-3 h-3 text-white" />
              )}
            </div>
          </div>

          {/* Image Count & Size Overlay */}
          {event.uploaded_images && event.uploaded_images.length > 0 && (
            <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg flex flex-col items-end">
              <div className="flex items-center space-x-2 text-white text-xs">
                <Image className="w-3 h-3" />
                <span>{event.uploaded_images.length} image{event.uploaded_images.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="text-[10px] text-gray-300 mt-1">
                Total: {formatSize(totalSize)}
              </div>
              <div className="text-[10px] text-gray-300 mt-0.5">
                Avg: {formatSize(averageSize)}
              </div>
            </div>
          )}
        </div>

        {/* Event Content */}
        <div className="p-6">
          <div className="mb-4">
            <h4 className="text-lg font-bold text-[#FFD426] mb-2 line-clamp-2">
              {event.eventName}
            </h4>
            <p className="text-gray-400 text-sm line-clamp-3">
              {event.description || 'No description provided'}
            </p>
          </div>

          {/* Event Details */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-800 rounded-lg">
                <Calendar className="w-4 h-4 text-[#FFD426]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Event Date</p>
                <p className="text-sm font-medium text-gray-200 truncate">
                  {event.date || 'Date not specified'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-800 rounded-lg">
                <Clock className="w-4 h-4 text-[#FFD426]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Created</p>
                <p className="text-sm font-medium text-gray-200 truncate">
                  {formatDate(event.createdAt)}
                </p>
              </div>
            </div>

            {/* Image Count & Size Details */}
            {event.uploaded_images && event.uploaded_images.length > 0 && (
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <Image className="w-4 h-4 text-[#FFD426]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Images</p>
                  <p className="text-sm font-medium text-gray-200">
                    {event.uploaded_images.length} images • {formatSize(totalSize)} total
                    <span className="text-gray-400 ml-1">
                      ({formatSize(averageSize)} avg)
                    </span>
                  </p>
                </div>
              </div>
            )}

            {event.compress_rate > 0 && (
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <Activity className="w-4 h-4 text-[#FFD426]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Compression</p>
                  <p className="text-sm font-medium text-gray-200">
                    {event.compress_rate}%
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Event Status Footer */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${event.isPublic ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                <span className="text-xs font-medium text-gray-400">
                  {event.isPublic ? 'Public Event' : 'Private Event'}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-400">
                <FileText className="w-3 h-3" />
                <span>ID: {event.id?.slice(0, 8)}...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  })}
</div>
    </div>
  );
};

// Subscription Details Component
const SubscriptionTab: React.FC<{ user: any; subscriptionStatus: any; formatDate: (date: any) => string }> = ({
  user,
  subscriptionStatus,
  formatDate
}) => {
  return (
    <div className="space-y-6">
      {/* Subscription Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#FFD426] rounded-lg">
            <CreditCard className="w-5 h-5 text-black" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#FFD426]">Subscription Details</h3>
            <p className="text-sm text-gray-400">Manage and view subscription information</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1 bg-gray-800 border border-gray-700 rounded-full">
          {user.subscription.planName === 'Pro' && <Crown className="w-4 h-4 text-[#FFD426]" />}
          {user.subscription.planName === 'Basic' && <Star className="w-4 h-4 text-[#FFD426]" />}
          <span className="text-sm font-medium text-[#FFD426]">{user.subscription.planName}</span>
        </div>
      </div>

      {/* Subscription Card */}
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
                  <p className="font-medium text-gray-100">{formatDate(user.subscription.activatedAt)}</p>
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
                  <p className="font-medium text-gray-100">{formatDate(user.subscription.expires_at)}</p>
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

      {/* Account Timeline */}
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

            {/* Subscription Activated - Only show if subscription exists */}
            {user.subscription.activatedAt && (
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
                    <p className="text-gray-100 font-medium">{formatDate(user.subscription.activatedAt)}</p>
                    <p className="text-sm text-gray-400 mt-1">Upgraded to {user.subscription.planName} plan with full access.</p>
                    </div>
                </div>
              </div>
            )}

            {/* Last Updated - Only show if updatedAt exists */}
            {user.updatedAt && (
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
            )}
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
            <p className="text-2xl font-bold text-[#FFD426]">0</p>
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
  );
};

// Main UserView Component
const UserView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'profile' | 'events' | 'subscription'>('profile');

  // Update current time every minute for live countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

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

  // Enhanced formatDate function to handle all Firebase timestamp formats
  const formatDate = (date: any) => {
    if (!date) return "Not available";

    try {
      let dateObj: Date;

      // Handle Firebase Timestamp objects (most common case)
      if (date && typeof date === 'object' && date.seconds !== undefined) {
        const milliseconds = date.seconds * 1000 + (date.nanoseconds || 0) / 1000000;
        dateObj = new Date(milliseconds);
      }
      // Handle Firestore timestamp with toDate method (if available)
      else if (date && typeof date === 'object' && typeof date.toDate === 'function') {
        dateObj = date.toDate();
      }
      // Handle string dates
      else if (typeof date === 'string') {
        dateObj = new Date(date);
        
        // If that fails, try parsing Firebase string format
        if (isNaN(dateObj.getTime())) {
          const dateMatch = date.match(/(\w+)\s+(\d{1,2}),\s+(\d{4})\s+at\s+(\d{1,2}):(\d{2}):(\d{2})\s+(AM|PM)/);
          if (dateMatch) {
            const [, month, day, year, hour, minute, second, ampm] = dateMatch;
            const months = {
              'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
              'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
            };
            
            let hour24 = parseInt(hour);
            if (ampm === 'PM' && hour24 !== 12) hour24 += 12;
            if (ampm === 'AM' && hour24 === 12) hour24 = 0;

            dateObj = new Date(
              parseInt(year),
              months[month as keyof typeof months],
              parseInt(day),
              hour24,
              parseInt(minute),
              parseInt(second)
            );
          }
        }
      }
      // Handle Date objects
      else if (date instanceof Date) {
        dateObj = date;
      }
      // Handle numeric timestamps (milliseconds or seconds)
      else if (typeof date === 'number') {
        dateObj = date > 10000000000 ? new Date(date) : new Date(date * 1000);
      }
      // Handle objects that might have _seconds property (alternative Firebase format)
      else if (date && typeof date === 'object' && date._seconds !== undefined) {
        const milliseconds = date._seconds * 1000 + (date._nanoseconds || 0) / 1000000;
        dateObj = new Date(milliseconds);
      }
      else {
        console.error('Unsupported date type in formatDate:', typeof date, date);
        return "Invalid date format";
      }

      // Validate the final date object
      if (isNaN(dateObj.getTime())) {
        console.error('Invalid date object created:', dateObj, 'from input:', date);
        return "Invalid date";
      }

      // Format the date
      const formatted = dateObj.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      return formatted;

    } catch (error) {
      console.error('Error formatting date:', error, 'Input was:', date);
      return "Invalid date";
    }
  };

  // Enhanced getSubscriptionStatus to handle timestamp objects
  const getSubscriptionStatus = (expiresAt: any) => {
    if (!expiresAt) {
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
      let expiryDate: Date;

      // Handle Firebase Timestamp objects
      if (expiresAt && typeof expiresAt === 'object' && expiresAt.seconds !== undefined) {
        expiryDate = new Date(expiresAt.seconds * 1000 + (expiresAt.nanoseconds || 0) / 1000000);
      }
      // Handle Firestore timestamp with toDate method
      else if (expiresAt && typeof expiresAt.toDate === 'function') {
        expiryDate = expiresAt.toDate();
      }
      // Handle Date objects
      else if (expiresAt instanceof Date) {
        expiryDate = expiresAt;
      }
      // Handle string dates (legacy format)
      else if (typeof expiresAt === 'string') {
        if (expiresAt.trim() === '') {
          return {
            isExpired: true,
            daysLeft: 0,
            hoursLeft: 0,
            minutesLeft: 0,
            status: 'No Subscription',
            timeRemaining: 'No active subscription'
          };
        }

        // Try to parse string format
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

        expiryDate = new Date(
          parseInt(year),
          months[month as keyof typeof months],
          parseInt(day),
          hour24,
          parseInt(minute),
          parseInt(second)
        );
      }
      else {
        console.error('Unsupported expiresAt type:', typeof expiresAt, expiresAt);
        return {
          isExpired: true,
          daysLeft: 0,
          hoursLeft: 0,
          minutesLeft: 0,
          status: 'Invalid Data',
          timeRemaining: 'Unsupported date format'
        };
      }

      // Validate the final date
      if (isNaN(expiryDate.getTime())) {
        console.error('Invalid expiry date:', expiryDate);
        return {
          isExpired: true,
          daysLeft: 0,
          hoursLeft: 0,
          minutesLeft: 0,
          status: 'Invalid Date',
          timeRemaining: 'Invalid expiry date'
        };
      }

      const now = new Date();
      const timeDiff = expiryDate.getTime() - now.getTime();
      const isExpired = timeDiff <= 0;

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

  // Safe getter for user data with defaults
  const getSafeUserData = () => {
    if (!user) return null;

    return {
      ...user,
      phoneNumber: user.phoneNumber || '',
      city: user.city || '',
      state: user.state || '',
      country: user.country || '',
      companyName: user.companyName || '',
      industry: user.industry || '',
      industryAreas: user.industryAreas || [],
      subscription: user.subscription ? {
        planName: user.subscription.planName || 'Free',
        billing: user.subscription.billing || 'Monthly',
        activatedAt: user.subscription.activatedAt || null,
        expires_at: user.subscription.expires_at || null
      } : {
        planName: 'Free',
        billing: 'None',
        activatedAt: null,
        expires_at: null
      }
    };
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

  const safeUser = getSafeUserData();
  if (!safeUser) return null;

  const subscriptionStatus = safeUser.subscription?.expires_at 
    ? getSubscriptionStatus(safeUser.subscription.expires_at)
    : {
        isExpired: true,
        daysLeft: 0,
        hoursLeft: 0,
        minutesLeft: 0,
        status: 'No Subscription',
        timeRemaining: 'No active subscription'
      };

  // Safe calculation for days active
  const daysActive = safeUser.createdAt ? 
    Math.floor((currentTime.getTime() - new Date(formatDate(safeUser.createdAt) === "Invalid date" ? 0 : (safeUser.createdAt as any)?.seconds ? safeUser.createdAt.seconds * 1000 : safeUser.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="min-h-screen bg-black">
      <ToastContainer />

      {/* Enhanced Header */}
      <div className="border-b border-gray-800 sticky top-0 z-40 backdrop-blur-sm bg-black/95">
        <div className="px-4 sm:px-6 lg:px-8">
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

      {/* Tab Navigation */}
      <div className="border-b border-gray-800">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'profile'
                  ? 'border-[#FFD426] text-[#FFD426]'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <UserCircle className="w-4 h-4" />
                <span>User Profile</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('subscription')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'subscription'
                  ? 'border-[#FFD426] text-[#FFD426]'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4" />
                <span>Subscription</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'events'
                  ? 'border-[#FFD426] text-[#FFD426]'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4" />
                <span>User Events</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'profile' ? (
          <UserProfileTab 
            user={safeUser} 
            subscriptionStatus={subscriptionStatus}
            daysActive={daysActive}
            currentTime={currentTime}
            formatDate={formatDate}
          />
        ) : activeTab === 'subscription' ? (
          <SubscriptionTab 
            user={safeUser} 
            subscriptionStatus={subscriptionStatus}
            formatDate={formatDate}
          />
        ) : (
          <UserEventsTab 
            userId={safeUser.uid} 
            formatDate={formatDate}
          />
        )}
      </div>

      {/* Enhanced Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete ${safeUser.name}'s account? This action cannot be undone and will remove all associated data, subscription information, and user preferences.`}
      />
    </div>
  );
};

export default UserView;