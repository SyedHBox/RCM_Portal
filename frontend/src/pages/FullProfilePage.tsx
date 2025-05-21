import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, User, DollarSign, Shield } from 'lucide-react';
import Header from '../components/layout/Header';
import GlassCard from '../components/ui/GlassCard';
import { useClaims } from '../contexts/ClaimContext';
import { useAuth } from '../contexts/AuthContext';

const FullProfilePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { id } = useParams<{ id: string }>();
  const { getClaim, currentClaim } = useClaims();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (id) {
      getClaim(id);
    }
  }, [id, getClaim, isAuthenticated, navigate]);

  if (!isAuthenticated || !currentClaim) return null;
  
  // Format value for display
  const formatValue = (value: any, label?: string): string => {
    // Explicitly handle null, undefined, and empty strings
    if (value === undefined || value === null || value === '') return 'N/A';
    
    // Format date strings to MM/DD/YYYY
    if (
      typeof value === 'string' && 
      (value.match(/^\d{4}-\d{2}-\d{2}/) || value.match(/^\d{4}\/\d{2}\/\d{2}/))
    ) {
      try {
        const date = new Date(value);
        // Check if date is valid before formatting
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
        }
      } catch (e) {
        // If date parsing fails, return the original value
        return value;
      }
    }
    
    if (typeof value === 'number') {
      // For IDs and other number fields, return as-is without decimal formatting
      if (label && (
          label.toLowerCase() === 'id' || 
          label.toLowerCase().includes('patient id') || 
          label.toLowerCase().includes('cpt id') || 
          label.toLowerCase().includes('units')
        )) {
        return value.toString();
      }
      
      // Format currency amounts - check for money-related labels
      if (label && (
          label.toLowerCase().includes('amount') || 
          label.toLowerCase().includes('check') ||
          label.toLowerCase().includes('amt') ||
          label.toLowerCase().includes('bal')
        )) {
        return `$${value.toFixed(2)}`;
      }
      
      // Format percentages
      if (label && label.toLowerCase().includes('percentage')) {
        return `${value.toFixed(2)}%`;
      }
      
      return value.toString();
    }
    
    return String(value);
  };
  
  // Field display component
  const Field: React.FC<{ label: string; value: any }> = ({ label, value }) => (
    <div className="mb-4">
      <p className="text-white/60 text-sm mb-1">{label}</p>
      <p className="font-medium">{formatValue(value, label)}</p>
    </div>
  );

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
          <div className="flex items-center gap-2 mb-2">
            <Link 
              to={`/profile/${id}`} 
              className="text-white/70 hover:text-white flex items-center gap-1 transition-colors"
            >
              <ChevronLeft size={18} />
              <span>Back to Profile</span>
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-white">
            Full Profile: CPT ID {currentClaim.cpt_id || 'N/A'}
          </h1>
          <p className="text-white/60 mt-2">
            Complete information for this claim
          </p>
        </motion.div>
        
        {/* Patient Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <GlassCard>
            <div className="flex items-center gap-2 mb-6">
              <User className="text-accent-400" size={22} />
              <h2 className="text-xl font-semibold">Patient Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Field label="Patient ID" value={currentClaim.patient_id} />
              <Field label="CPT ID" value={currentClaim.cpt_id} />
              <Field label="Patient EMR No." value={currentClaim.patient_emr_no} />
              <Field label="First Name" value={currentClaim.first_name} />
              <Field label="Last Name" value={currentClaim.last_name} />
              <Field label="Date of Birth" value={currentClaim.date_of_birth} />
              <Field label="CPT Code" value={currentClaim.cpt_code} />
              <Field label="ICD Code" value={currentClaim.icd_code} />
              <Field label="Provider Name" value={currentClaim.provider_name} />
              <Field label="Service Start" value={currentClaim.service_start} />
              <Field label="Service End" value={currentClaim.service_end} />
              <Field label="Units" value={currentClaim.units} />
            </div>
          </GlassCard>
        </motion.div>
        
        {/* Claim & Billing Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <GlassCard>
            <div className="flex items-center gap-2 mb-6">
              <DollarSign className="text-accent-400" size={22} />
              <h2 className="text-xl font-semibold">Claim & Billing Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Field label="OA Claim ID" value={currentClaim.oa_claim_id} />
              <Field label="OA Visit ID" value={currentClaim.oa_visit_id} />
              <Field label="Charge Date" value={currentClaim.charge_dt} />
              <Field label="Charge Amount" value={currentClaim.charge_amt} />
              <Field label="Allowed Amount" value={currentClaim.allowed_amt} />
              <Field label="Allowed Add Amount" value={currentClaim.allowed_add_amt} />
              <Field label="Allowed Exp Amount" value={currentClaim.allowed_exp_amt} />
              <Field label="Total Amount" value={currentClaim.total_amt} />
              <Field label="Charges Adj Amount" value={currentClaim.charges_adj_amt} />
              <Field label="Write Off Amount" value={currentClaim.write_off_amt} />
              <Field label="Balance Amount" value={currentClaim.bal_amt} />
              <Field label="Reimbursement Percentage" value={currentClaim.reimb_pct} />
              <Field label="Claim Status" value={currentClaim.claim_status} />
              <Field label="Claim Status Type" value={currentClaim.claim_status_type} />
            </div>
          </GlassCard>
        </motion.div>
        
        {/* Insurance Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <GlassCard>
            <div className="flex items-center gap-2 mb-6">
              <Shield className="text-accent-400" size={22} />
              <h2 className="text-xl font-semibold">Insurance Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Primary Insurance */}
              <div className="md:col-span-3 mt-2 mb-4">
                <h3 className="text-lg font-medium text-white/90 border-b border-white/10 pb-2 mb-4">Primary Insurance</h3>
              </div>
              
              <Field label="Primary Insurance" value={currentClaim.prim_ins} />
              <Field label="Primary Amount" value={currentClaim.prim_amt} />
              <Field label="Primary Post Date" value={currentClaim.prim_post_dt} />
              <Field label="Primary Check Details" value={currentClaim.prim_chk_det} />
              <Field label="Primary Received Date" value={currentClaim.prim_recv_dt} />
              <Field label="Primary Check Amount" value={currentClaim.prim_chk_amt} />
              <div className="md:col-span-3">
                <Field label="Primary Comment" value={currentClaim.prim_cmt} />
              </div>
              
              {/* Secondary Insurance */}
              <div className="md:col-span-3 mt-4 mb-4">
                <h3 className="text-lg font-medium text-white/90 border-b border-white/10 pb-2 mb-4">Secondary Insurance</h3>
              </div>
              
              <Field label="Secondary Insurance" value={currentClaim.sec_ins} />
              <Field label="Secondary Amount" value={currentClaim.sec_amt} />
              <Field label="Secondary Post Date" value={currentClaim.sec_post_dt} />
              <Field label="Secondary Check Details" value={currentClaim.sec_chk_det} />
              <Field label="Secondary Received Date" value={currentClaim.sec_recv_dt} />
              <Field label="Secondary Check Amount" value={currentClaim.sec_chk_amt} />
              <div className="md:col-span-3">
                <Field label="Secondary Comment" value={currentClaim.sec_cmt} />
              </div>
              
              {/* Patient Payment */}
              <div className="md:col-span-3 mt-4 mb-4">
                <h3 className="text-lg font-medium text-white/90 border-b border-white/10 pb-2 mb-4">Patient Payment</h3>
              </div>
              
              <Field label="Patient Amount" value={currentClaim.pat_amt} />
              <Field label="Patient Received Date" value={currentClaim.pat_recv_dt} />
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default FullProfilePage;