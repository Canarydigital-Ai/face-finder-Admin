import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaBook, 
  FaBuilding, 
  FaCog,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import { GiBrain } from "react-icons/gi";
import { clearAdminAuth } from '../store/slices/adminSlice';
import { getAuth, signOut } from 'firebase/auth';
import { useAppDispatch } from '../hooks/redux';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  route?: string;
  action?: () => void;
  color?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const [, setSelectedItem] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  const closeOnMobile = () => {
    if (isMobile && !isCollapsed) onToggleCollapse();
  };

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      dispatch(clearAdminAuth());
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('isAdmin');
      await signOut(auth);
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout Error:', error);
      dispatch(clearAdminAuth());
      localStorage.clear();
      navigate('/admin/login');
    }
  };

  const menuItems: MenuItem[] = [
    {
      name: 'Dashboard',
      icon: <FaTachometerAlt size={20} />,
      route: '/admin/dashboard',
      color: '#3B82F6'
    },
    {
      name: 'Subscriptions',
      icon: <FaBook size={20} />,
      route: '/admin/subscriptions-list',
      color: '#10B981'
    },
    {
      name: 'Users',
      icon: <FaBuilding size={20} />,
      route: '/admin/users',
      color: '#F59E0B'
    }, 
    {
      name: 'AI Settings',
      icon: <GiBrain  size={22} />,
      route: '/admin/ai-settings',
      color: '#FFE100'
    }
  ];

  const handleSelect = (item: MenuItem) => {
    setSelectedItem(item.name);
    
    if (item.route) {
      navigate(item.route);
      closeOnMobile();
    } else if (item.action) {
      item.action();
    }
  };

  return (
    <div
      className={`relative text-white h-full bg-[#0F0F0F] border-r border-[#222222] transition-all duration-500 ease-in-out ${
        isCollapsed ? "w-[70px]" : "w-full"
      }`}
    >
      {/* Collapsed Sidebar */}
      <div
        className={`absolute inset-0 transition-all duration-500 ease-in-out ${
          isCollapsed
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-full pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center h-full py-6">
          {/* Toggle Button & Logo */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <button
              onClick={onToggleCollapse}
              className="w-[35px] h-[35px] rounded-[20px] bg-[#FCCA00] text-black flex items-center justify-center cursor-pointer hover:bg-[#e6b800] transition-colors"
            >
              <FaChevronRight size={14} />
            </button>
            <div className="w-[45px] h-[45px] rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <FaTachometerAlt className="text-white text-xl" />
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex flex-col items-center gap-3 mb-6 flex-1">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleSelect(item)}
                title={item.name}
                className={`p-3 rounded-full hover:bg-[#2d2d3a] transition-all duration-200 ${
                  isActive(item.route || '') ? "bg-[#3e3e52]" : ""
                }`}
              >
                <span 
                  className={`${
                    isActive(item.route || '') ? `text-[${item.color}]` : "text-gray-400"
                  }`}
                  style={{ 
                    color: isActive(item.route || '') ? item.color : undefined 
                  }}
                >
                  {item.icon}
                </span>
              </button>
            ))}
          </div>

          {/* Logout */}
          <div className="mt-auto">
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-3 rounded-full hover:bg-red-600/20 transition-colors text-red-400 hover:text-red-300"
            >
              <FaSignOutAlt size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Sidebar */}
      <div
        className={`absolute inset-0 transition-all duration-500 ease-in-out ${
          !isCollapsed
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-full pointer-events-none"
        }`}
      >
        <div className="flex flex-col justify-between h-full py-6 px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-[45px] h-[45px] rounded-full bg-gradient-to-br from-[#FFD426] to-gray-800 flex items-center justify-center">
                <FaTachometerAlt className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Admin Panel</h2>
                <p className="text-xs text-gray-400">Selfind Management</p>
              </div>
            </div>
            <button
              onClick={onToggleCollapse}
              className="w-[35px] h-[35px] rounded-[20px] bg-[#FCCA00] text-black flex items-center justify-center cursor-pointer hover:bg-[#e6b800] transition-colors"
            >
              <FaChevronLeft size={14} />
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleSelect(item)}
                className={`w-full text-left py-3 px-4 rounded-lg hover:bg-[#2d2d3a] flex items-center gap-4 cursor-pointer transition-all duration-200 ${
                  isActive(item.route || '')
                    ? "bg-[#2d2d3a] border-l-4"
                    : "hover:border-l-4 hover:border-gray-600"
                }`}
                style={{
                  borderLeftColor: isActive(item.route || '') ? item.color : undefined
                }}
              >
                <span 
                  className={`${
                    isActive(item.route || '') ? "opacity-100" : "text-gray-400"
                  }`}
                  style={{ 
                    color: isActive(item.route || '') ? item.color : undefined 
                  }}
                >
                  {item.icon}
                </span>
                <span className={`font-medium ${
                  isActive(item.route || '') ? "text-white" : "text-gray-300"
                }`}>
                  {item.name}
                </span>
              </button>
            ))}
          </div>

          {/* Bottom Section */}
          <div className="space-y-4 border-t border-gray-700 pt-4">
            {/* Settings */}
            <button
              onClick={() => {
                navigate('/admin/settings');
                closeOnMobile();
              }}
              className={`w-full text-left py-3 px-4 rounded-lg hover:bg-[#2d2d3a] flex items-center gap-4 cursor-pointer transition-colors ${
                isActive('settings') ? "text-[#FCCA00]" : "text-gray-300"
              }`}
            >
              <FaCog size={18} />
              <span>Settings</span>
            </button>

            {/* User Info */}
            <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#333333]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {(localStorage.getItem('userEmail') || 'A').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Admin</p>
                  <p className="text-sm font-medium text-white truncate">
                    {localStorage.getItem('userEmail') || 'Administrator'}
                  </p>
                </div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full text-left py-3 px-4 rounded-lg flex items-center gap-4 text-red-400 hover:bg-red-600/10 hover:text-red-300 transition-all duration-200 cursor-pointer"
            >
              <FaSignOutAlt size={18} />
              <span className="font-medium">Logout</span>
            </button>

            {/* Copyright */}
            <div className="text-xs text-gray-500 text-center pt-2">
              <span>Selfind management</span>
              <div className="text-gray-600 mt-1">v2.0.1</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;