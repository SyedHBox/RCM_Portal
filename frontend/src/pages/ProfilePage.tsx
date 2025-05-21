import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, FileText } from 'lucide-react';
import Header from '../components/layout/Header';
import SummaryCard from '../components/profile/SummaryCard';
import ClaimTabs from '../components/profile/ClaimTabs';
import HistorySection from '../components/profile/HistorySection';
import Button from '../components/ui/Button';
import { useClaims } from '../contexts/ClaimContext';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { id } = useParams<{ id: string }>();
  const { getClaim, currentClaim } = useClaims();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false); // State to toggle expanded view
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (id) {
      getClaim(id);
    }
  }, [id, getClaim, isAuthenticated, navigate]);

  const handleViewFullProfile = () => {
    navigate(`/full-profile/${id}`);
  };

  // Toggle details view
  const toggleDetails = () => {
    setShowDetails(prev => !prev);
  };

  // Format date safely
  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  if (!isAuthenticated || !currentClaim) return null;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-300 to-dark-400">
      <Header />
      
      <div className="container mx-auto pt-24 pb-12 px-4 md:px-6">
        {/* Replace motion.div with regular div */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Link 
              to="/search" 
              className="text-white/70 hover:text-white flex items-center gap-1"
            >
              <ChevronLeft size={18} />
              <span>Back to Search</span>
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-white">
            CPT ID: {currentClaim.cpt_id || 'N/A'}
          </h1>
          <p className="text-white/60 mt-2">
            Patient: {`${currentClaim.first_name} ${currentClaim.last_name}`} | 
            DOS: {formatDate(currentClaim.service_end || currentClaim.dos)}
          </p>
        </div>
        
        <SummaryCard claim={currentClaim} onToggleDetails={toggleDetails} isExpanded={showDetails} />
        
        {/* Show ClaimTabs instantly without animation */}
        {showDetails && (
          <div className="border-t border-white/10 pt-6 mt-6">
            <ClaimTabs claim={currentClaim} />
          </div>
        )}
        
        {/* History Section */}
        <HistorySection claimId={currentClaim.id} />
        
        {/* Replace motion.div with regular div */}
        <div className="mt-8 flex justify-center">
          <Button 
            variant="secondary" 
            className="text-white/80 hover:text-white px-4 py-2 rounded-md border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 shadow-sm"
            icon={<FileText size={18} />}
            onClick={handleViewFullProfile}
          >
            View Full Profile
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
