import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { 
  FaArrowLeft, 
  FaEdit, 
  FaTrash, 
  FaGoogle, 
  FaCrown, 
  FaFire,
  FaCalendarAlt,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
  FaIndustry,
  FaCreditCard,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle
} from "react-icons/fa";
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

  const handleEdit = () => {
    navigate(`/admin/edit-user/${id}`);
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
    if (!date) return "N/A";
    return new Date(date.seconds ? date.seconds * 1000 : date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSubscriptionStatus = (expiresAt: string) => {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const isExpired = expiryDate < now;
    const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      isExpired,
      daysLeft,
      status: isExpired ? 'Expired' : daysLeft <= 7 ? 'Expiring Soon' : 'Active'
    };
  };

  const getCountryName = (countryCode: string) => {
    const countries: { [key: string]: string } = {
      'IN': 'India',
      'US': 'United States',
      'GB': 'United Kingdom',
      'CA': 'Canada',
      // Add more country codes as needed
    };
    return countries[countryCode] || countryCode;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-b-4 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading User Details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">User not found</p>
          <button
            onClick={() => navigate("/admin/users")}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  const subscriptionStatus = getSubscriptionStatus(user.subscription.expires_at);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <ToastContainer />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/users")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
          >
            <FaArrowLeft />
            Back to Users
          </button>
          <h1 className="text-2xl font-bold text-gray-800">User Details</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            <FaEdit />
            Edit User
          </button>
          <button
            onClick={() => setIsDeleteDialogOpen(true)}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
          >
            <FaTrash />
            Delete User
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="relative inline-block">
                <img
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=128`}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-gray-200"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=128`;
                  }}
                />
                {user.provider === 'google.com' && (
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                    <FaGoogle className="w-5 h-5 text-red-500" />
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-800 mt-4">{user.name}</h2>
              <p className="text-gray-600 text-sm">User ID: {user.uid}</p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                  </p>
                  <p className="text-xs text-gray-500">Days Active</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {subscriptionStatus.isExpired ? '0' : subscriptionStatus.daysLeft}
                  </p>
                  <p className="text-xs text-gray-500">Days Left</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaUser className="text-blue-500" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <FaEnvelope className="text-gray-400 w-5 h-5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaPhone className="text-gray-400 w-5 h-5" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{user.phoneNumber || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 md:col-span-2">
                <FaMapMarkerAlt className="text-gray-400 w-5 h-5" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">
                    {[user.city, user.state, getCountryName(user.country)].filter(Boolean).join(', ') || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaBuilding className="text-green-500" />
              Company & Professional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <FaBuilding className="text-gray-400 w-5 h-5" />
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="font-medium">{user.companyName || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaIndustry className="text-gray-400 w-5 h-5" />
                <div>
                  <p className="text-sm text-gray-500">Industry</p>
                  <p className="font-medium">{user.industry || 'Not provided'}</p>
                </div>
              </div>
              {user.industryAreas && user.industryAreas.length > 0 && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-2">Industry Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {user.industryAreas.map((area, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Subscription Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaCreditCard className="text-purple-500" />
              Subscription Details
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {user.subscription.planName === 'Pro' && <FaCrown className="w-5 h-5 text-purple-500" />}
                    {user.subscription.planName === 'Basic' && <FaFire className="w-5 h-5 text-orange-500" />}
                    <span className="text-xl font-bold">{user.subscription.planName} Plan</span>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                    {user.subscription.billing}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {subscriptionStatus.status === 'Active' && <FaCheckCircle className="text-green-500" />}
                  {subscriptionStatus.status === 'Expiring Soon' && <FaExclamationTriangle className="text-yellow-500" />}
                  {subscriptionStatus.status === 'Expired' && <FaTimesCircle className="text-red-500" />}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      subscriptionStatus.status === 'Active'
                        ? "bg-green-100 text-green-800"
                        : subscriptionStatus.status === 'Expiring Soon'
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {subscriptionStatus.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <FaCalendarAlt className="text-gray-400 w-5 h-5" />
                  <div>
                    <p className="text-sm text-gray-500">Activated On</p>
                    <p className="font-medium">{user.subscription.activatedAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaClock className="text-gray-400 w-5 h-5" />
                  <div>
                    <p className="text-sm text-gray-500">Expires On</p>
                    <p className="font-medium">{user.subscription.expires_at}</p>
                  </div>
                </div>
              </div>

              {!subscriptionStatus.isExpired && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700">
                    <FaClock />
                    <span className="font-medium">
                      {subscriptionStatus.daysLeft > 1 
                        ? `${subscriptionStatus.daysLeft} days remaining`
                        : subscriptionStatus.daysLeft === 1
                        ? "1 day remaining"
                        : "Expires today"
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Timeline */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaCalendarAlt className="text-orange-500" />
              Account Timeline
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Account Created</p>
                  <p className="text-sm text-gray-500">{formatDate(user.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Subscription Activated</p>
                  <p className="text-sm text-gray-500">{user.subscription.activatedAt}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-gray-400 rounded-full flex items-center justify-center">
                  <MdUpdate className="w-2 h-2 text-white" />
                </div>
                <div>
                  <p className="font-medium">Last Updated</p>
                  <p className="text-sm text-gray-500">{formatDate(user.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete User Account"
        message={`Are you sure you want to delete ${user.name}'s account? This action cannot be undone and will permanently remove all user data.`}
      />
    </div>
  );
};

export default UserView;