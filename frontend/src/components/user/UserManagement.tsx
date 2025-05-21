import React, { useState, useEffect, useCallback, useMemo, memo, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, Edit2, Trash2, Search, Check, X, AlertCircle, ShieldAlert
} from 'lucide-react';
import Button from '../ui/Button';
import GlassInput from '../ui/GlassInput';
import { User } from '../../types/auth';
import { useAuth } from '../../contexts/AuthContext';

// Custom search icon that matches the website style like in the login form
const SearchIcon = () => (
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
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.3-4.3"></path>
  </svg>
);

// Clearer version of the icon
const ClearSearchIcon = () => (
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
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.3-4.3"></path>
  </svg>
);

// Mock list of users for demonstration
const mockUsers: User[] = [
  { 
    id: '1', 
    name: 'Admin User', 
    email: 'HBilling_RCM@HBOX.AI', 
    role: 'Admin',
    avatar: 'https://i.pravatar.cc/150?img=1'
  },
  { 
    id: '2', 
    name: 'Syed A', 
    email: 'syed.a@hbox.ai', 
    role: 'User',
    avatar: 'https://i.pravatar.cc/150?img=2'
  },
  { 
    id: '3', 
    name: 'John Davis', 
    email: 'john.d@hbox.ai', 
    role: 'User',
    avatar: 'https://i.pravatar.cc/150?img=3'
  },
  { 
    id: '4', 
    name: 'Maria Rodriguez', 
    email: 'maria.r@hbox.ai', 
    role: 'Admin',
    avatar: 'https://i.pravatar.cc/150?img=4'
  }
];

interface UserFormData {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: string;
}

const UserManagement: React.FC = () => {
  const { user: currentLoggedInUser } = useAuth();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<UserFormData | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPermissionError, setShowPermissionError] = useState(false);

  // Memoize filtered users to prevent unnecessary re-rendering
  const filteredUsers = useMemo(() => 
    users.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
    ), 
    [users, searchQuery]
  );
  
  // Check if there's more than one admin in the system
  const hasMultipleAdmins = useMemo(() => 
    users.filter(user => user.role === 'Admin').length > 1,
    [users]
  );

  const handleOpenCreateModal = useCallback(() => {
    setCurrentUser({
      name: '',
      email: '',
      password: '',
      role: 'User'
    });
    setFormErrors({});
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((user: User) => {
    setCurrentUser({
      id: user.id,
      name: user.name,
      email: user.email,
      password: '',  // Password is empty when editing
      role: user.role
    });
    setFormErrors({});
    setIsModalOpen(true);
  }, []);

  const handleOpenDeleteModal = useCallback((user: User) => {
    // Check if trying to delete yourself as admin
    if (currentLoggedInUser?.id === user.id && user.role === 'Admin') {
      if (!hasMultipleAdmins) {
        setShowPermissionError(true);
        setTimeout(() => setShowPermissionError(false), 3000);
        return;
      }
    }
    
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  }, [currentLoggedInUser, hasMultipleAdmins]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    // Use a timeout to allow the exit animation to complete
    // before removing the user data
    setTimeout(() => {
      setCurrentUser(null);
    }, 300);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    // Use a timeout to allow the exit animation to complete
    setTimeout(() => {
      setUserToDelete(null);
    }, 300);
  }, []);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!currentUser?.name) {
      errors.name = 'Name is required';
    }

    if (!currentUser?.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(currentUser.email)) {
      errors.email = 'Email format is invalid';
    }

    // Only validate password for new users
    if (!currentUser?.id && !currentUser?.password) {
      errors.password = 'Password is required for new users';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveUser = useCallback(() => {
    if (!validateForm() || !currentUser) return;

    if (currentUser.id) {
      // Update existing user
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === currentUser.id 
            ? { ...user, name: currentUser.name, email: currentUser.email, role: currentUser.role }
            : user
        )
      );
    } else {
      // Create new user
      const newUser: User = {
        id: Math.random().toString(36).substring(2, 9), // Generate random ID
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 20) + 1}`
      };
      setUsers(prevUsers => [...prevUsers, newUser]);
    }
    
    setIsModalOpen(false);
    // Delay clearing the form data until after animation completes
    setTimeout(() => {
      setCurrentUser(null);
    }, 300);
  }, [currentUser]);

  const handleDeleteUser = useCallback(() => {
    if (!userToDelete) return;
    
    // Check if trying to delete yourself as admin
    if (currentLoggedInUser?.id === userToDelete.id && userToDelete.role === 'Admin') {
      if (!hasMultipleAdmins) {
        setShowPermissionError(true);
        setTimeout(() => setShowPermissionError(false), 3000);
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
        return;
      }
    }
    
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userToDelete.id));
    setIsDeleteModalOpen(false);
    // Delay clearing the user data until after animation completes
    setTimeout(() => {
      setUserToDelete(null);
    }, 300);
  }, [currentLoggedInUser, hasMultipleAdmins, userToDelete]);

  const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (currentUser) {
      setCurrentUser(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [currentUser, formErrors]);
  
  // Generate background color based on name for avatar
  const getAvatarColor = useCallback((name: string) => {
    const colors = [
      'bg-accent-500', 'bg-primary-500', 'bg-success-500', 
      'bg-warning-500', 'bg-error-500', 'bg-blue-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'
    ];
    
    // Simple hash function to get consistent color for a name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  }, []);

  // Modal components
  const UserFormModal = memo(({ isOpen, user, onClose, onSave, errors, onChange }: {
    isOpen: boolean;
    user: UserFormData | null;
    onClose: () => void;
    onSave: () => void;
    errors: Record<string, string>;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  }) => {
    if (!user) return null;
    
    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-dark-300 rounded-xl shadow-xl w-full max-w-md p-6 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">
                {user.id ? 'Edit User' : 'Create New User'}
              </h2>
              <div className="space-y-4">
                <div>
                  <GlassInput
                    label="Name"
                    name="name"
                    placeholder="Enter full name"
                    value={user.name}
                    onChange={onChange}
                    error={errors.name}
                  />
                </div>
                <div>
                  <GlassInput
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    value={user.email}
                    onChange={onChange}
                    error={errors.email}
                  />
                </div>
                <div>
                  <GlassInput
                    label={`Password ${user.id ? '(Leave blank to keep current)' : ''}`}
                    name="password"
                    type="password"
                    placeholder={user.id ? "••••••••" : "Enter password"}
                    value={user.password}
                    onChange={onChange}
                    error={errors.password}
                  />
                </div>
                <div>
                  <label className="block text-white/80 mb-2 font-medium">Role</label>
                  <select
                    name="role"
                    value={user.role}
                    onChange={onChange}
                    className="glass-input w-full bg-dark-500 text-white"
                    style={{ background: '#1a1a2e', color: 'white' }}
                  >
                    <option value="User" className="bg-dark-500 text-white">User</option>
                    <option value="Admin" className="bg-dark-500 text-white">Admin</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="secondary"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="accent"
                    onClick={onSave}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  });

  const DeleteUserModal = memo(({ isOpen, user, onClose, onDelete }: {
    isOpen: boolean;
    user: User | null;
    onClose: () => void;
    onDelete: () => void;
  }) => {
    if (!user) return null;
    
    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ 
                type: "spring", 
                stiffness: 500, 
                damping: 30,
                mass: 0.8
              }}
              className="bg-dark-300 rounded-xl shadow-xl w-full max-w-md p-6 border border-white/10"
              style={{ 
                willChange: 'transform, opacity',
                transform: 'translateZ(0)'
              }}
            >
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <AlertCircle size={48} className="text-error-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Delete User</h2>
                <p className="text-white/70 mb-6">
                  Are you sure you want to delete the user <span className="font-semibold text-white">{user.name}</span>?
                  This action cannot be undone.
                </p>
                <div className="flex justify-center gap-3">
                  <Button
                    variant="secondary"
                    onClick={onClose}
                    icon={<X size={18} />}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    className="bg-error-600 hover:bg-error-700"
                    onClick={onDelete}
                    icon={<Check size={18} />}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  });

  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-4 md:mb-0 w-full md:w-64">
          <GlassInput
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<SearchIcon />}
            clearIcon={<ClearSearchIcon />}
            className="w-full focus:ring-2 focus:ring-primary-500/60 shadow-[0_0_10px_2px_rgba(59,130,246,0.3)]"
          />
        </div>
        <Button
          variant="primary"
          icon={<UserPlus size={18} />}
          onClick={handleOpenCreateModal}
          className="w-full md:w-auto shadow-sm hover:shadow flex items-center gap-2 text-white/90 hover:text-white px-4 py-2 rounded-md border border-white/10 hover:border-white/20 bg-gradient-to-r from-accent-500/90 to-primary-600/90 hover:from-accent-500 hover:to-primary-600"
        >
          Create New User
        </Button>
      </div>
      
      {/* Permission Error Alert */}
      {showPermissionError && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-4 bg-error-900/50 text-error-200 px-4 py-3 rounded-lg flex items-center gap-2"
        >
          <ShieldAlert size={18} />
          <span>You cannot delete/deactivate your own admin account when you are the only admin in the system.</span>
        </motion.div>
      )}

      <div className="glass-card-dark rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-300/50 text-white/80">
              <tr>
                <th className="px-6 py-4 text-left font-medium">Name</th>
                <th className="px-6 py-4 text-left font-medium">Email</th>
                <th className="px-6 py-4 text-left font-medium">Role</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-white flex items-center gap-3">
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${getAvatarColor(user.name)}`}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-white/80">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'Admin' 
                          ? 'bg-accent-500/20 text-accent-300' 
                          : 'bg-primary-500/20 text-primary-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleOpenEditModal(user)}
                        className="text-white/60 hover:text-white p-1 rounded-md hover:bg-white/10"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleOpenDeleteModal(user)}
                        className={`p-1 rounded-md ${
                          currentLoggedInUser?.id === user.id && user.role === 'Admin' && !hasMultipleAdmins
                            ? 'text-error-400/40 hover:text-error-400/40 cursor-not-allowed'
                            : 'text-error-400 hover:text-error-500 hover:bg-error-500/10'
                        }`}
                        disabled={currentLoggedInUser?.id === user.id && user.role === 'Admin' && !hasMultipleAdmins}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-white/60">
                    No users found matching your search criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Initialize empty form state to preload the modal */}
      {!currentUser && (
        <div style={{ display: 'none' }}>
          {setCurrentUser({
            name: '',
            email: '',
            password: '',
            role: 'User'
          })}
        </div>
      )}

      {/* User and Delete Modals with optimized rendering */}
      <UserFormModal 
        isOpen={isModalOpen} 
        user={currentUser} 
        onClose={handleCloseModal} 
        onSave={handleSaveUser} 
        errors={formErrors} 
        onChange={handleFormChange}
      />
      <DeleteUserModal 
        isOpen={isDeleteModalOpen} 
        user={userToDelete} 
        onClose={handleCloseDeleteModal} 
        onDelete={handleDeleteUser} 
      />
    </>
  );
};

export default UserManagement;