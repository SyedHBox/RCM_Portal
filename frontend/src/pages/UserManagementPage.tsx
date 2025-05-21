import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { useAuth } from '../contexts/AuthContext';
import UserManagement from '../components/user/UserManagement';

const UserManagementPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Redirect non-admin users
    if (user?.role !== 'Admin') {
      navigate('/search');
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || user?.role !== 'Admin') return null;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-300 to-dark-400">
      <Header />
      
      <div className="container mx-auto pt-24 pb-12 px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-white/60 mt-2">
            Create, edit, and manage user accounts for the RCM system
          </p>
        </motion.div>
        
        <UserManagement />
      </div>
    </div>
  );
};

export default UserManagementPage;