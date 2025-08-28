import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { FaLock, FaEnvelope, FaEye, FaEyeSlash, FaUserShield } from 'react-icons/fa';
import { adminLogin } from '../../api/services/authService'; 
import { useAppSelector, useAppDispatch } from '../../hooks/redux'; 
import { setAdminAuth } from '../../store/slices/adminSlice'; 
import type { RootState } from '../../store/slices';

const AdminLogin: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state: RootState) => state.admin);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // State to manage form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // 3D tilt effect
  const MAX_TILT = 10;
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const scaleMv = useMotionValue(1);
  const scale = useSpring(scaleMv, { stiffness: 260, damping: 20, mass: 0.4 });

  const handleMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    const rY = (px - 0.5) * MAX_TILT;
    const rX = -(py - 0.5) * MAX_TILT;

    rotX.set(rX);
    rotY.set(rY);
  };

  const handleEnter = () => {
    scaleMv.set(1.02);
  };

  const handleLeave = () => {
    rotX.set(0);
    rotY.set(0);
    scaleMv.set(1);
  };

  // Check if already authenticated
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const email = localStorage.getItem('userEmail');
    
    if ((token && email) || isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [navigate, isAuthenticated]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const user = await adminLogin(formData);
      
      if (user) {
        const token = localStorage.getItem('authToken');
        if (token) {
          dispatch(setAdminAuth({
            token: token,
            user: {
              id: user.uid || 'admin',
              email: user.email || formData.email,
              name: user.displayName || 'Admin',
              role: 'admin'
            }
          }));
        }
        
        toast.success('Login successful!', {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
        navigate('/admin/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Invalid email or password', {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
        delayChildren: 0.2,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 15,
      },
    },
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0F0F0F]"
      onMouseEnter={handleEnter}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[#FFD426]/10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[#FFD426]/5 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#FFD426]/5 animate-spin" style={{ animationDuration: '20s' }}></div>
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md mx-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          transformStyle: "preserve-3d",
          rotateX: rotX,
          rotateY: rotY,
          scale,
        }}
      >
        {/* Glassmorphism container */}
        <div className="backdrop-blur-xl bg-[#16161A]/80 border border-[#FFD426]/20 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with Logo Space */}
          <motion.div 
            className="text-center py-8 px-6 bg-[#16161A]/60 border-b border-[#FFD426]/20"
            variants={itemVariants}
          >
            {/* Logo/Icon Container - Add your logo here */}
            <div className="w-20 h-20 mx-auto mb-4 bg-[#FFD426] rounded-full flex items-center justify-center shadow-lg">
              {/* Replace this div with your logo image */}
              <div className="w-16 h-16 rounded-full bg-black/20 flex items-center justify-center">
                <FaUserShield className="text-2xl text-black" />
                {/* You can replace the above with: <img src={YourLogoHere} alt="Logo" className="w-12 h-12" /> */}
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2"> Super Admin Portal</h1>
            <p className="text-gray-300 text-sm">Secure access to super admin dashboard</p>
          </motion.div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="email"
                    name="email"
                    required
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-3 bg-[#16161A] border border-[#FFD426]/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD426]/50 focus:border-[#FFD426] transition-all duration-300 disabled:opacity-50"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </motion.div>

              {/* Password Input */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    disabled={loading}
                    className="w-full pl-12 pr-12 py-3 bg-[#16161A] border border-[#FFD426]/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD426]/50 focus:border-[#FFD426] transition-all duration-300 disabled:opacity-50"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#FFD426] transition-colors"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                variants={itemVariants}
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 bg-[#FFD426] hover:bg-[#e6b800] text-black font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-black"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <FaUserShield />
                    <span>Sign In</span>
                  </>
                )}
              </motion.button>
            </form>
          </div>

          {/* Footer */}
          <motion.div 
            className="px-8 py-6 bg-[#16161A]/40 border-t border-[#FFD426]/20 text-center"
            variants={itemVariants}
          >
            <p className="text-xs text-gray-400">
              Secure admin access • Protected by enterprise security
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-[#FFD426] rounded-full animate-pulse"></div>
              <span>System Online</span>
            </div>
          </motion.div>
        </div>

        {/* Floating decorative elements */}
        <div className="absolute -top-6 -right-6 w-12 h-12 bg-[#FFD426] rounded-full opacity-20 animate-bounce delay-300"></div>
        <div className="absolute -bottom-6 -left-6 w-8 h-8 bg-[#FFD426] rounded-full opacity-30 animate-bounce delay-700"></div>
      </motion.div>

      {/* Bottom attribution */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-xs text-gray-500">
          Powered by <span className="text-[#FFD426]">Admin Management System</span>
        </p>
      </div>
    </div>
  );
});

export default AdminLogin;