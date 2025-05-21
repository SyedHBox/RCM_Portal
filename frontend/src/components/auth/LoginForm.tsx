import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GlassInput from '../ui/GlassInput';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { LoginCredentials } from '../../types/auth';

// Custom Mail and Lock icon components that match the website style
const MailIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="text-white/80"
  >
    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
  </svg>
);

const LockIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="text-white/80"
  >
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

// Clearer versions of the icons
const ClearMailIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="white" 
    strokeWidth="2"
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
  </svg>
);

const ClearLockIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="white" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const LoginForm: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginResult, setLoginResult] = useState<{success: boolean; error?: string} | null>(null);
  
  // Navigate when authenticated and not in controlled loading state
  useEffect(() => {
    if (isAuthenticated && !isLoggingIn && loginResult?.success) {
      console.log('User is authenticated, navigating to search page');
      navigate('/search');
    }
  }, [isAuthenticated, navigate, isLoggingIn, loginResult]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    // Also clear form error when typing
    if (errors.form) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.form;
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!credentials.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!credentials.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent default form submission behavior that would cause page reload
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      console.log('Submitting login form with:', credentials.email);
      
      // Set logging in state to true to show loading UI
      setIsLoggingIn(true);
      setLoginResult(null);
      // Clear any previous form errors
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.form;
        return newErrors;
      });
      
      // Record the start time
      const startTime = Date.now();
      
      // Try to login with the provided credentials
      const loginSuccess = await login({
        email: credentials.email,
        password: credentials.password
      });
      
      // Calculate how much time has elapsed
      const elapsedTime = Date.now() - startTime;
      
      // Calculate remaining time to ensure EXACTLY 1.5 seconds (1500ms) of loading
      const remainingDelay = Math.max(0, 1500 - elapsedTime);
      
      // Use setTimeout to ensure consistent timing regardless of success or failure
      setTimeout(() => {
        if (loginSuccess) {
          // Login successful - will navigate after delay via useEffect
          setLoginResult({ success: true });
          console.log("Login successful, preparing to navigate");
        } else {
          // Login failed
          console.log("Login failed, showing error message");
          setLoginResult({ 
            success: false, 
            error: 'Invalid email or password. Please try again.' 
          });
          setErrors({ form: 'Invalid email or password. Please try again.' });
        }
        // Turn off loading state after consistent delay
        setIsLoggingIn(false);
      }, remainingDelay);
      
    } catch (error) {
      console.error('Login form submission error:', error);
      
      // For errors, always wait the full 1.5 seconds before showing error
      const remainingDelay = 1500; // Always wait full 1.5 seconds for errors
      
      // Wait for the minimum delay before showing error
      setTimeout(() => {
        setLoginResult({ 
          success: false, 
          error: 'An error occurred during login. Please try again.' 
        });
        setErrors({ form: 'An error occurred during login. Please try again.' });
        setIsLoggingIn(false);
      }, remainingDelay);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="w-full max-w-md"
    >
      <div className="mb-8 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut", delay: 0.2 }}
          className="text-3xl font-bold text-white mb-2"
        >
          Welcome to RCM
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut", delay: 0.3 }}
          className="text-white/60"
        >
          Sign in to access HBox's internal billing portal.
        </motion.p>
      </div>
      
      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeInOut", delay: 0.4 }}
      >
        <GlassInput
          label="Email"
          type="email"
          name="email"
          placeholder="your@email.com"
          value={credentials.email}
          onChange={handleChange}
          icon={<MailIcon />}
          clearIcon={<ClearMailIcon />}
          error={errors.email}
          autoComplete="email"
        />
        
        <GlassInput
          label="Password"
          type="password"
          name="password"
          placeholder="••••••••"
          value={credentials.password}
          onChange={handleChange}
          icon={<LockIcon />}
          clearIcon={<ClearLockIcon />}
          error={errors.password}
          autoComplete="current-password"
        />
        
        {errors.form && (
          <motion.p 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm font-medium mt-2"
            data-testid="login-error"
          >
            {errors.form}
          </motion.p>
        )}
        
        <div className="pt-6">
          <Button 
            type="submit" 
            className="w-full py-3.5 text-base font-medium tracking-wide bg-gradient-to-r from-accent-500/90 to-primary-600/90 hover:from-accent-500 hover:to-primary-600 backdrop-blur-lg border border-accent-400/30 shadow-lg shadow-accent-500/20" 
            isLoading={isLoggingIn}
          >
            {isLoggingIn ? "Signing In..." : "Sign In"}
          </Button>
        </div>
      </motion.form>
    </motion.div>
  );
};

export default LoginForm;
