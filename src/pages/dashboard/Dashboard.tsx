import React, { useEffect, useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  ResponsiveContainer 
} from 'recharts';
import { 
  FaUsers, 
  FaCalendarAlt, 
  FaRupeeSign, 
  FaCrown, 
  FaArrowUp, 
  FaArrowDown, 
  FaUserFriends,
  FaChartLine,
  FaCreditCard
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { 
  getDashboardStats, 
  type DashboardStats, 
  type Event, 
  type Payment 
} from '../../api/services/dashboardService';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const dashboardData = await getDashboardStats();
      setStats(dashboardData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0F0F0F]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#FFD426] border-b-4 mx-auto mb-4"></div>
          <p className="text-[#FFD426]">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0F0F0F]">
        <div className="text-center">
          <p className="text-[#FFD426] text-xl">Failed to load dashboard data</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 bg-[#FFD426] text-black px-6 py-2 rounded-md hover:bg-[#e6b800] transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const monthlyRevenueData = Object.entries(stats.monthlyRevenue).map(([month, revenue]) => ({
    month,
    revenue,
    formattedMonth: new Date(month + '-01').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
  }));

  const eventTypeData = Object.entries(stats.eventTypeDistribution).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count
  }));

  const subscriptionData = Object.entries(stats.subscriptionDistribution).map(([plan, count]) => ({
    name: plan,
    value: count
  }));

  const dailyStatsData = Object.entries(stats.dailyStats)
    .slice(-7) // Last 7 days
    .map(([date, data]) => ({
      date: new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      revenue: data.revenue,
      events: data.events,
      users: data.users
    }));

  // Color schemes
  const COLORS = ['#FFD426', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: number;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, trend, color, subtitle }) => (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 hover:border-[#FFD426] transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div 
          className="p-3 rounded-full"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {icon}
        </div>
      </div>
      {trend !== undefined && (
        <div className="flex items-center mt-3">
          {trend > 0 ? (
            <FaArrowUp className="text-green-500 mr-1" size={12} />
          ) : (
            <FaArrowDown className="text-red-500 mr-1" size={12} />
          )}
          <span className={`text-sm font-medium ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {Math.abs(trend)}%
          </span>
          <span className="text-gray-400 text-sm ml-1">from last month</span>
        </div>
      )}
    </div>
  );

  const RecentEventCard: React.FC<{ event: Event }> = ({ event }) => (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4 hover:border-[#FFD426] transition-all duration-300">
      <div className="flex items-center gap-3">
        <img 
          src={event.coverImage} 
          alt={event.eventName}
          className="w-12 h-12 rounded-lg object-cover border border-[#FFD426]"
        />
        <div className="flex-1">
          <h4 className="text-white font-semibold text-sm">{event.eventName}</h4>
          <p className="text-[#FFD426] text-xs capitalize">{event.eventType}</p>
          <p className="text-gray-400 text-xs">{new Date(event.date).toLocaleDateString('en-IN')}</p>
        </div>
        <div className="text-right">
          <p className="text-white text-sm">{event.uploaded_images?.length || 0}</p>
          <p className="text-gray-400 text-xs">photos</p>
        </div>
      </div>
    </div>
  );

  const RecentPaymentCard: React.FC<{ payment: Payment }> = ({ payment }) => (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4 hover:border-[#FFD426] transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white font-semibold">₹{payment.amount.toLocaleString()}</p>
          <p className="text-[#FFD426] text-sm">{payment.plan_name} Plan</p>
          <p className="text-gray-400 text-xs">{payment.billing}</p>
        </div>
        <div className="text-right">
          <span 
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              payment.payment_status === 'completed' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {payment.payment_status}
          </span>
          <p className="text-gray-400 text-xs mt-1">
            {new Date(payment.created_at).toLocaleDateString('en-IN')}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F0F0F] p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#FFD426] mb-2">Dashboard</h1>
        {/* <p className="text-gray-400">Welcome back! Here's what's happening with your platform.</p> */}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={<FaUsers size={20} />}
          color="#FFD426"
          trend={12}
        />
        <StatCard
          title="Total Events"
          value={stats.totalEvents.toLocaleString()}
          icon={<FaCalendarAlt size={20} />}
          color="#4ECDC4"
          trend={8}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={<FaRupeeSign size={20} />}
          color="#FF6B6B"
          trend={15}
        />
        <StatCard
          title="Active Subscriptions"
          value={stats.activeSubscriptions}
          icon={<FaCrown size={20} />}
          color="#96CEB4"
          subtitle={`${stats.expiredSubscriptions} expired`}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Guest Users"
          value={stats.totalGuestUsers.toLocaleString()}
          icon={<FaUserFriends size={20} />}
          color="#FFEAA7"
        />
        <StatCard
          title="Total Payments"
          value={stats.totalPayments.toLocaleString()}
          icon={<FaCreditCard size={20} />}
          color="#45B7D1"
        />
        <StatCard
          title="Avg. Revenue/User"
          value={`₹${Math.round(stats.totalRevenue / (stats.totalUsers || 1))}`}
          icon={<FaChartLine size={20} />}
          color="#DDA0DD"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Revenue Chart */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6">
          <h3 className="text-xl font-semibold text-[#FFD426] mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="formattedMonth" 
                stroke="#666" 
                fontSize={12}
              />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#FFD426'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#FFD426" 
                fill="#FFD426"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Activity */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6">
          <h3 className="text-xl font-semibold text-[#FFD426] mb-4">Last 7 Days Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyStatsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#FFD426'
                }}
              />
              <Bar dataKey="revenue" fill="#FFD426" />
              <Bar dataKey="events" fill="#4ECDC4" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Event Types Distribution */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6">
          <h3 className="text-xl font-semibold text-[#FFD426] mb-4">Event Types</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={eventTypeData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
               label={({ name, percent } ) => percent !== undefined ? `${name} ${(percent * 100).toFixed(0)}%` : `${name}`}
              >
                {eventTypeData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#FFD426'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Subscription Distribution */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6">
          <h3 className="text-xl font-semibold text-[#FFD426] mb-4">Subscription Plans</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={subscriptionData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent } ) => percent !== undefined ? `${name} ${(percent * 100).toFixed(0)}%` : `${name}`}
              >
                {subscriptionData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#FFD426'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-[#FFD426]">Recent Events</h3>
            <FaCalendarAlt className="text-[#FFD426]" />
          </div>
          <div className="space-y-3">
            {stats.recentEvents.length > 0 ? (
              stats.recentEvents.map((event) => (
                <RecentEventCard key={event.id} event={event} />
              ))
            ) : (
              <p className="text-gray-400">No recent events</p>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-[#FFD426]">Recent Payments</h3>
            <FaRupeeSign className="text-[#FFD426]" />
          </div>
          <div className="space-y-3">
            {stats.recentPayments.length > 0 ? (
              stats.recentPayments.map((payment) => (
                <RecentPaymentCard key={payment.id} payment={payment} />
              ))
            ) : (
              <p className="text-gray-400">No recent payments</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;