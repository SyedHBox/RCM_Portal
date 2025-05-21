import React, { useState, useEffect, useRef, memo } from 'react';
import { FileText, AlertCircle, CheckCircle, XCircle, Save, Loader2 } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import GlassInput from '../ui/GlassInput';
import Button from '../ui/Button';
import { VisitClaim } from '../../types/claim';
import { useClaims } from '../../contexts/ClaimContext';

interface ClaimTabsProps {
  claim: VisitClaim;
}

type TabType = 'claim' | 'primary' | 'secondary';

interface ClaimDetailsForm {
  oaClaimId: string;
  oaVisitId: string;
  chargeDt: string;
  chargeAmount: string;
}

interface PrimaryInsuranceForm {
  primIns: string;
  primAmt: string;
  primPostDt: string;
  primChkDetails: string;
  primRecDt: string;
  primChkAmt: string;
  primCmnt: string;
  primDenialCode: string;
}

interface SecondaryInsuranceForm {
  secIns: string;
  secAmt: string;
  secPostDt: string;
  secChkDetails: string;
  secRecDt: string;
  secChkAmt: string;
  secCmnt: string;
  patAmt: string;
  patRecDt: string;
  secDenialCode: string;
}

type FeedbackStatus = 'success' | 'error' | null;

interface FeedbackMessage {
  status: FeedbackStatus;
  message: string;
}

// Removed unused formatDisplayValue function

// Format value for input field (avoid "N/A" in actual inputs)
const formatInputValue = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
};

// Format the charge date properly for date input fields
const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  
  try {
    // Parse the date string
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    // Format as YYYY-MM-DD for input type="date"
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (e) {
    console.warn('Failed to format date value for input:', dateString);
    return '';
  }
};

const ClaimTabs: React.FC<ClaimTabsProps> = ({ claim }) => {
  const { updateClaim } = useClaims();
  const [activeTab, setActiveTab] = useState<TabType>('claim');
  const [showTooltip, setShowTooltip] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage>({ status: null, message: '' });
  const [localIsLoading, setLocalIsLoading] = useState(false);
  
  // Reference to track whether forms have been initialized
  const initializedRef = useRef(false);
  const previousClaimRef = useRef(claim);
  
  // State for claim details form
  const [claimDetailsForm, setClaimDetailsForm] = useState<ClaimDetailsForm>({
    oaClaimId: formatInputValue(claim.oa_claim_id),
    oaVisitId: formatInputValue(claim.oa_visit_id),
    chargeDt: formatInputValue(claim.charge_dt),
    chargeAmount: claim.charge_amt != null ? claim.charge_amt.toString() : '',
  });

  // State for primary insurance form
  const [primaryForm, setPrimaryForm] = useState<PrimaryInsuranceForm>({
    primIns: formatInputValue(claim.prim_ins),
    primAmt: claim.prim_amt != null ? claim.prim_amt.toString() : '',
    primPostDt: formatInputValue(claim.prim_post_dt),
    primChkDetails: formatInputValue(claim.prim_chk_det),
    primRecDt: formatInputValue(claim.prim_recv_dt),
    primChkAmt: claim.prim_chk_amt != null ? claim.prim_chk_amt.toString() : '',
    primCmnt: formatInputValue(claim.prim_cmt),
    primDenialCode: formatInputValue(claim.claim_status_type),
  });

  // State for secondary insurance form
  const [secondaryForm, setSecondaryForm] = useState<SecondaryInsuranceForm>({
    secIns: formatInputValue(claim.sec_ins),
    secAmt: claim.sec_amt != null ? claim.sec_amt.toString() : '',
    secPostDt: formatInputValue(claim.sec_post_dt),
    secChkDetails: formatInputValue(claim.sec_chk_det),
    secRecDt: formatInputValue(claim.sec_recv_dt),
    secChkAmt: claim.sec_chk_amt != null ? claim.sec_chk_amt.toString() : '',
    secCmnt: formatInputValue(claim.sec_cmt),
    patAmt: claim.pat_amt != null ? claim.pat_amt.toString() : '',
    patRecDt: formatInputValue(claim.pat_recv_dt),
    secDenialCode: formatInputValue(claim.sec_denial_code),
  });

  // Initialize forms only once when component mounts or when claim ID changes
  useEffect(() => {
    const isNewClaim = claim.id !== previousClaimRef.current.id;
    
    if (!initializedRef.current || isNewClaim) {
      setClaimDetailsForm({
        oaClaimId: formatInputValue(claim.oa_claim_id),
        oaVisitId: formatInputValue(claim.oa_visit_id),
        chargeDt: formatInputValue(claim.charge_dt),
        chargeAmount: claim.charge_amt != null ? claim.charge_amt.toString() : '',
      });
      
      setPrimaryForm({
        primIns: formatInputValue(claim.prim_ins),
        primAmt: claim.prim_amt != null ? claim.prim_amt.toString() : '',
        primPostDt: formatInputValue(claim.prim_post_dt),
        primChkDetails: formatInputValue(claim.prim_chk_det),
        primRecDt: formatInputValue(claim.prim_recv_dt),
        primChkAmt: claim.prim_chk_amt != null ? claim.prim_chk_amt.toString() : '',
        primCmnt: formatInputValue(claim.prim_cmt),
        primDenialCode: formatInputValue(claim.claim_status_type),
      });
      
      setSecondaryForm({
        secIns: formatInputValue(claim.sec_ins),
        secAmt: claim.sec_amt != null ? claim.sec_amt.toString() : '',
        secPostDt: formatInputValue(claim.sec_post_dt),
        secChkDetails: formatInputValue(claim.sec_chk_det),
        secRecDt: formatInputValue(claim.sec_recv_dt),
        secChkAmt: claim.sec_chk_amt != null ? claim.sec_chk_amt.toString() : '',
        secCmnt: formatInputValue(claim.sec_cmt),
        patAmt: claim.pat_amt != null ? claim.pat_amt.toString() : '',
        patRecDt: formatInputValue(claim.pat_recv_dt),
        secDenialCode: formatInputValue(claim.sec_denial_code),
      });
      
      initializedRef.current = true;
      previousClaimRef.current = claim;
    }
  }, [claim]);
  
  // Clear feedback after 5 seconds
  useEffect(() => {
    if (feedback.status) {
      const timer = setTimeout(() => {
        setFeedback({ status: null, message: '' });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Function to ensure form data is complete before allowing submission
  const isClaimDetailsComplete = (): boolean => {
    return (
      !!claimDetailsForm.oaClaimId &&
      !!claimDetailsForm.oaVisitId &&
      !!claimDetailsForm.chargeDt &&
      !!claimDetailsForm.chargeAmount
    );
  };

  // Format date for input fields to ensure proper format
  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (e) {
      console.error('Error formatting date for input:', e);
    }
    
    return dateString.toString();
  };

  // Improved handle switch tab with proper validation
  const handleSwitchTab = (tab: TabType) => {
    // Only validate when trying to leave claim tab
    if (tab !== 'claim' && !isClaimDetailsComplete()) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000);
      return;
    }
    
    // Save the current tab data before switching
    if (activeTab === 'claim') {
      // Force save claim details
      handleSaveClaimDetails();
    } else if (activeTab === 'primary') {
      // Force save primary form
      handleSavePrimary();
    } else if (activeTab === 'secondary') {
      // Force save secondary form
      handleSaveSecondary();
    }
    
    // After saving the current tab, switch to the new tab
    setActiveTab(tab);
  };

  const handleTabClick = (tab: TabType) => {
    // Only allow switching if:
    // 1. Going to claim tab (always allowed)
    // 2. Going to other tabs and claim details are complete
    if (tab === 'claim' || isClaimDetailsComplete()) {
      // Save the current tab data before switching
      if (activeTab === 'claim') {
        handleSaveClaimDetails().then(() => {
          setActiveTab(tab);
        });
      } else if (activeTab === 'primary') {
        handleSavePrimary().then(() => {
          setActiveTab(tab);
        });
      } else if (activeTab === 'secondary') {
        handleSaveSecondary().then(() => {
          setActiveTab(tab);
        });
      } else {
        setActiveTab(tab);
      }
    } else {
      // Show tooltip for incomplete claim details
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000);
    }
  };

  const handleClaimDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClaimDetailsForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Add debouncing to avoid too many updates
    clearTimeout(detailsDebounceRef.current);
    detailsDebounceRef.current = setTimeout(() => {
      // Create the update object with only the fields being updated
      const fieldMapping: Record<string, string> = {
        oaClaimId: 'oa_claim_id',
        oaVisitId: 'oa_visit_id',
        chargeDt: 'charge_dt',
        chargeAmount: 'charge_amt'
      };
      
      // Only update the changed field
      const updateData: Record<string, any> = { id: claim.id };
      const apiFieldName = fieldMapping[name];
      
      if (apiFieldName) {
        // Handle numeric values appropriately
        if (name === 'chargeAmount') {
          updateData[apiFieldName] = value ? parseFloat(value) : undefined;
        } else {
          updateData[apiFieldName] = value.trim() || undefined;
        }
        
        // Show a subtle loading indicator
        setFieldLoading(name);
        
        updateClaim(updateData)
          .then(() => {
            showFieldSuccess(name);
          })
          .catch((err) => {
            console.error(`Error updating ${name}:`, err);
            showFieldError(name);
          })
          .finally(() => {
            setTimeout(() => clearFieldState(name), 2000);
          });
      }
    }, 800); // 800ms debounce time
  };

  const handlePrimaryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPrimaryForm(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Add debouncing to avoid too many updates
    clearTimeout(primaryDebounceRef.current);
    primaryDebounceRef.current = setTimeout(() => {
      // Map form field names to API field names
      const fieldMapping: Record<string, string> = {
        primIns: 'prim_ins',
        primAmt: 'prim_amt',
        primPostDt: 'prim_post_dt',
        primChkDetails: 'prim_chk_det',
        primRecDt: 'prim_recv_dt',
        primChkAmt: 'prim_chk_amt',
        primCmnt: 'prim_cmt',
        primDenialCode: 'claim_status_type'
      };
      
      // Only update the changed field
      const updateData: Record<string, any> = { id: claim.id };
      const apiFieldName = fieldMapping[name];
      
      if (apiFieldName) {
        // Handle numeric values appropriately
        if (name === 'primAmt' || name === 'primChkAmt') {
          updateData[apiFieldName] = value && value.trim() !== '' ? parseFloat(value) : undefined;
        } else {
          updateData[apiFieldName] = value.trim() || undefined;
        }
        
        // Show a subtle loading indicator
        setFieldLoading(name);
        
        updateClaim(updateData)
          .then(() => {
            showFieldSuccess(name);
          })
          .catch((err) => {
            console.error(`Error updating ${name}:`, err);
            showFieldError(name);
          })
          .finally(() => {
            setTimeout(() => clearFieldState(name), 2000);
          });
      }
    }, 800); // 800ms debounce time
  };

  const handleSecondaryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSecondaryForm(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Add debouncing to avoid too many updates
    clearTimeout(secondaryDebounceRef.current);
    secondaryDebounceRef.current = setTimeout(() => {
      // Map form field names to API field names
      const fieldMapping: Record<string, string> = {
        secIns: 'sec_ins',
        secAmt: 'sec_amt',
        secPostDt: 'sec_post_dt',
        secChkDetails: 'sec_chk_det',
        secRecDt: 'sec_recv_dt',
        secChkAmt: 'sec_chk_amt',
        secCmnt: 'sec_cmt',
        secDenialCode: 'sec_denial_code',
        patAmt: 'pat_amt',
        patRecDt: 'pat_recv_dt'
      };
      
      // Only update the changed field
      const updateData: Record<string, any> = { id: claim.id };
      const apiFieldName = fieldMapping[name];
      
      if (apiFieldName) {
        // Handle numeric values appropriately
        if (name === 'secAmt' || name === 'secChkAmt' || name === 'patAmt') {
          updateData[apiFieldName] = value && value.trim() !== '' ? parseFloat(value) : undefined;
        } else {
          updateData[apiFieldName] = value.trim() || undefined;
        }
        
        // Show a subtle loading indicator
        setFieldLoading(name);
        
        updateClaim(updateData)
          .then(() => {
            showFieldSuccess(name);
          })
          .catch((err) => {
            console.error(`Error updating ${name}:`, err);
            showFieldError(name);
          })
          .finally(() => {
            setTimeout(() => clearFieldState(name), 2000);
          });
      }
    }, 800); // 800ms debounce time
  };

  const handleSaveClaimDetails = async () => {
    // Validate required fields
    if (!isClaimDetailsComplete()) {
      setFeedback({
        status: 'error',
        message: 'Please fill in all required fields in the Claim Details tab.'
      });
      return;
    }
    
    try {
      setLocalIsLoading(true);
      
      // Create the update object with only fields that have actually changed
      const updateData: Record<string, any> = { id: claim.id };
      
      // Compare with current claim data and only include changed fields
      if (formatInputValue(claim.oa_claim_id) !== claimDetailsForm.oaClaimId.trim()) {
        updateData.oa_claim_id = claimDetailsForm.oaClaimId.trim() || undefined;
      }
      
      if (formatInputValue(claim.oa_visit_id) !== claimDetailsForm.oaVisitId.trim()) {
        updateData.oa_visit_id = claimDetailsForm.oaVisitId.trim() || undefined;
      }
      
      if (formatInputValue(claim.charge_dt) !== claimDetailsForm.chargeDt.trim()) {
        updateData.charge_dt = claimDetailsForm.chargeDt.trim() || undefined;
      }
      
      const formAmount = parseFloat(claimDetailsForm.chargeAmount) || 0;
      const claimAmount = claim.charge_amt || 0;
      if (formAmount !== claimAmount) {
        updateData.charge_amt = formAmount;
      }
      
      // Only send update if there are actual changes
      if (Object.keys(updateData).length > 1) { // > 1 because id is always included
        await updateClaim(updateData);
        
        setFeedback({
          status: 'success',
          message: 'Claim details saved successfully!'
        });
      } else {
        // No changes were made
        setFeedback({
          status: 'success',
          message: 'No changes to save in Claim Details.'
        });
      }
    } catch (err) {
      setFeedback({
        status: 'error',
        message: 'An error occurred while saving claim details.'
      });
      console.error('Error saving claim details:', err);
    } finally {
      setLocalIsLoading(false);
    }
  };

  const handleSavePrimary = async () => {
    try {
      setLocalIsLoading(true);
      
      // Create the update object with only fields that have actually changed
      const updateData: Record<string, any> = { id: claim.id };
      
      // Compare with current claim data and only include changed fields
      if (formatInputValue(claim.prim_ins) !== primaryForm.primIns.trim()) {
        updateData.prim_ins = primaryForm.primIns.trim() || undefined;
      }
      
      const formPrimAmt = primaryForm.primAmt ? parseFloat(primaryForm.primAmt) : null;
      const claimPrimAmt = claim.prim_amt !== undefined && claim.prim_amt !== null ? claim.prim_amt : null;
      if (formPrimAmt !== claimPrimAmt) {
        updateData.prim_amt = formPrimAmt;
      }
      
      if (formatInputValue(claim.prim_post_dt) !== primaryForm.primPostDt.trim()) {
        updateData.prim_post_dt = primaryForm.primPostDt.trim() || undefined;
      }
      
      if (formatInputValue(claim.prim_chk_det) !== primaryForm.primChkDetails.trim()) {
        updateData.prim_chk_det = primaryForm.primChkDetails.trim() || undefined;
      }
      
      if (formatInputValue(claim.prim_recv_dt) !== primaryForm.primRecDt.trim()) {
        updateData.prim_recv_dt = primaryForm.primRecDt.trim() || undefined;
      }
      
      const formPrimChkAmt = primaryForm.primChkAmt ? parseFloat(primaryForm.primChkAmt) : null;
      const claimPrimChkAmt = claim.prim_chk_amt !== undefined && claim.prim_chk_amt !== null ? claim.prim_chk_amt : null;
      if (formPrimChkAmt !== claimPrimChkAmt) {
        updateData.prim_chk_amt = formPrimChkAmt;
      }
      
      if (formatInputValue(claim.prim_cmt) !== primaryForm.primCmnt.trim()) {
        updateData.prim_cmt = primaryForm.primCmnt.trim() || undefined;
      }
      
      if (formatInputValue(claim.claim_status_type) !== primaryForm.primDenialCode.trim()) {
        updateData.claim_status_type = primaryForm.primDenialCode.trim() || undefined;
      }
      
      // Only send update if there are actual changes
      if (Object.keys(updateData).length > 1) { // > 1 because id is always included
        await updateClaim(updateData);
        
        setFeedback({
          status: 'success',
          message: 'Primary insurance details saved successfully!'
        });
      } else {
        // No changes were made
        setFeedback({
          status: 'success',
          message: 'No changes to save in Primary Insurance.'
        });
      }
    } catch (err) {
      setFeedback({
        status: 'error',
        message: 'An error occurred while saving primary insurance details.'
      });
      console.error('Error saving primary insurance details:', err);
    } finally {
      setLocalIsLoading(false);
    }
  };

  const handleSaveSecondary = async () => {
    try {
      setLocalIsLoading(true);
      
      // Create the update object with only fields that have actually changed
      const updateData: Record<string, any> = { id: claim.id };
      
      // Compare with current claim data and only include changed fields
      if (formatInputValue(claim.sec_ins) !== secondaryForm.secIns.trim()) {
        updateData.sec_ins = secondaryForm.secIns.trim() || undefined;
      }
      
      const formSecAmt = secondaryForm.secAmt ? parseFloat(secondaryForm.secAmt) : null;
      const claimSecAmt = claim.sec_amt !== undefined && claim.sec_amt !== null ? claim.sec_amt : null;
      if (formSecAmt !== claimSecAmt) {
        updateData.sec_amt = formSecAmt;
      }
      
      if (formatInputValue(claim.sec_post_dt) !== secondaryForm.secPostDt.trim()) {
        updateData.sec_post_dt = secondaryForm.secPostDt.trim() || undefined;
      }
      
      if (formatInputValue(claim.sec_chk_det) !== secondaryForm.secChkDetails.trim()) {
        updateData.sec_chk_det = secondaryForm.secChkDetails.trim() || undefined;
      }
      
      if (formatInputValue(claim.sec_recv_dt) !== secondaryForm.secRecDt.trim()) {
        updateData.sec_recv_dt = secondaryForm.secRecDt.trim() || undefined;
      }
      
      const formSecChkAmt = secondaryForm.secChkAmt ? parseFloat(secondaryForm.secChkAmt) : null;
      const claimSecChkAmt = claim.sec_chk_amt !== undefined && claim.sec_chk_amt !== null ? claim.sec_chk_amt : null;
      if (formSecChkAmt !== claimSecChkAmt) {
        updateData.sec_chk_amt = formSecChkAmt;
      }
      
      if (formatInputValue(claim.sec_cmt) !== secondaryForm.secCmnt.trim()) {
        updateData.sec_cmt = secondaryForm.secCmnt.trim() || undefined;
      }
      
      if (formatInputValue(claim.sec_denial_code) !== secondaryForm.secDenialCode.trim()) {
        updateData.sec_denial_code = secondaryForm.secDenialCode.trim() || undefined;
      }
      
      const formPatAmt = secondaryForm.patAmt ? parseFloat(secondaryForm.patAmt) : null;
      const claimPatAmt = claim.pat_amt !== undefined && claim.pat_amt !== null ? claim.pat_amt : null;
      if (formPatAmt !== claimPatAmt) {
        updateData.pat_amt = formPatAmt;
      }
      
      if (formatInputValue(claim.pat_recv_dt) !== secondaryForm.patRecDt.trim()) {
        updateData.pat_recv_dt = secondaryForm.patRecDt.trim() || undefined;
      }
      
      // Only send update if there are actual changes
      if (Object.keys(updateData).length > 1) { // > 1 because id is always included
        await updateClaim(updateData);
        
        setFeedback({
          status: 'success',
          message: 'Secondary insurance details saved successfully!'
        });
      } else {
        // No changes were made
        setFeedback({
          status: 'success',
          message: 'No changes to save in Secondary Insurance.'
        });
      }
    } catch (err) {
      console.error('Error saving secondary insurance details:', err);
      setFeedback({
        status: 'error',
        message: 'An error occurred while saving secondary insurance details.'
      });
    } finally {
      setLocalIsLoading(false);
    }
  };

  // References for debounce timers
  const detailsDebounceRef = useRef<NodeJS.Timeout>();
  const primaryDebounceRef = useRef<NodeJS.Timeout>();
  const secondaryDebounceRef = useRef<NodeJS.Timeout>();
  
  // Field status tracking for real-time feedback
  type FieldStatus = 'loading' | 'success' | 'error' | null;
  const [fieldStatuses, setFieldStatuses] = useState<Record<string, FieldStatus>>({});
  
  // Helper functions to update field statuses
  const setFieldLoading = (fieldName: string) => {
    setFieldStatuses(prev => ({ ...prev, [fieldName]: 'loading' }));
  };
  
  const showFieldSuccess = (fieldName: string) => {
    setFieldStatuses(prev => ({ ...prev, [fieldName]: 'success' }));
  };
  
  const showFieldError = (fieldName: string) => {
    setFieldStatuses(prev => ({ ...prev, [fieldName]: 'error' }));
  };
  
  const clearFieldState = (fieldName: string) => {
    setFieldStatuses(prev => ({ ...prev, [fieldName]: null }));
  };

  const claimDetailsComplete = isClaimDetailsComplete();

  // Render without motion animations to improve performance
  return (
    <div>
      {/* Feedback message */}
      {feedback.status && (
        <div
          className={`mb-4 p-4 rounded-md flex items-center gap-2 ${
            feedback.status === 'success' ? 'bg-success-900/30 text-success-400' : 'bg-error-900/30 text-error-400'
          }`}
        >
          {feedback.status === 'success' ? (
            <CheckCircle size={18} className="text-success-400" />
          ) : (
            <XCircle size={18} className="text-error-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}
      
      <GlassCard className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex border-b border-white/10 flex-1">
            <button
              onClick={() => handleTabClick('claim')}
              className={`px-4 py-3 font-medium transition-colors relative ${
                activeTab === 'claim'
                  ? 'text-accent-400 border-b-2 border-accent-400'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Claim Details
            </button>
            <button
              onClick={() => handleTabClick('primary')}
              className={`px-4 py-3 font-medium transition-colors relative ${
                activeTab === 'primary'
                  ? 'text-accent-400 border-b-2 border-accent-400'
                  : 'text-white/70 hover:text-white'
              } ${!claimDetailsComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!claimDetailsComplete}
            >
              Primary Insurance
              {activeTab !== 'claim' && showTooltip && !claimDetailsComplete && (
                <div className="absolute top-full left-0 mt-2 w-64 p-2 bg-dark-500 text-white text-sm rounded shadow-lg z-10">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-error-400" />
                    <span>Please complete Claim Details first</span>
                  </div>
                </div>
              )}
            </button>
            <button
              onClick={() => handleTabClick('secondary')}
              className={`px-4 py-3 font-medium transition-colors relative ${
                activeTab === 'secondary'
                  ? 'text-accent-400 border-b-2 border-accent-400'
                  : 'text-white/70 hover:text-white'
              } ${!claimDetailsComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!claimDetailsComplete}
            >
              Secondary Insurance
            </button>
          </div>
          
          {/* Save button in tab header */}
          <Button
            onClick={
              activeTab === 'claim' 
                ? handleSaveClaimDetails 
                : activeTab === 'primary' 
                  ? handleSavePrimary 
                  : handleSaveSecondary
            }
            icon={<Save size={16} />}
            disabled={localIsLoading || (activeTab !== 'claim' && !claimDetailsComplete)}
            className="ml-4"
          >
            {localIsLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </GlassCard>

      {/* Conditional rendering for tab content */}
      {activeTab === 'claim' && (
        <GlassCard>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="text-accent-400" size={20} />
              Claim Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="mb-4">
              <label className="block text-white/80 mb-2 font-medium">
                OA Claim ID <span className="text-error-400">*</span>
              </label>
              <div className="relative">
                <input
                  name="oaClaimId"
                  value={claimDetailsForm.oaClaimId}
                  onChange={handleClaimDetailsChange}
                  className={`glass-input w-full
                    ${fieldStatuses.oaClaimId === 'loading' ? 'border-warning-500/50' : ''}
                    ${fieldStatuses.oaClaimId === 'success' ? 'border-success-500/50' : ''}
                    ${fieldStatuses.oaClaimId === 'error' ? 'border-error-500/50' : ''}
                  `}
                  type="text"
                  required
                />
                {fieldStatuses.oaClaimId && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    {fieldStatuses.oaClaimId === 'loading' && (
                      <Loader2 size={16} className="animate-spin text-warning-400" />
                    )}
                    {fieldStatuses.oaClaimId === 'success' && (
                      <CheckCircle size={16} className="text-success-400" />
                    )}
                    {fieldStatuses.oaClaimId === 'error' && (
                      <AlertCircle size={16} className="text-error-400" />
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-white/80 mb-2 font-medium">
                OA Visit ID <span className="text-error-400">*</span>
              </label>
              <div className="relative">
                <input
                  name="oaVisitId"
                  value={claimDetailsForm.oaVisitId}
                  onChange={handleClaimDetailsChange}
                  className={`glass-input w-full
                    ${fieldStatuses.oaVisitId === 'loading' ? 'border-warning-500/50' : ''}
                    ${fieldStatuses.oaVisitId === 'success' ? 'border-success-500/50' : ''}
                    ${fieldStatuses.oaVisitId === 'error' ? 'border-error-500/50' : ''}
                  `}
                  type="text"
                  required
                />
                {fieldStatuses.oaVisitId && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    {fieldStatuses.oaVisitId === 'loading' && (
                      <Loader2 size={16} className="animate-spin text-warning-400" />
                    )}
                    {fieldStatuses.oaVisitId === 'success' && (
                      <CheckCircle size={16} className="text-success-400" />
                    )}
                    {fieldStatuses.oaVisitId === 'error' && (
                      <AlertCircle size={16} className="text-error-400" />
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-white/80 mb-2 font-medium">
                Charge Date <span className="text-error-400">*</span>
              </label>
              <div className="flex flex-col">
                <div className="relative">
                  <input
                    name="chargeDt"
                    type="date"
                    value={formatDateForInput(claimDetailsForm.chargeDt)}
                    onChange={handleClaimDetailsChange}
                    className={`glass-input w-full
                      ${fieldStatuses.chargeDt === 'loading' ? 'border-warning-500/50' : ''}
                      ${fieldStatuses.chargeDt === 'success' ? 'border-success-500/50' : ''}
                      ${fieldStatuses.chargeDt === 'error' ? 'border-error-500/50' : ''}
                    `}
                    required
                  />
                  {fieldStatuses.chargeDt && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      {fieldStatuses.chargeDt === 'loading' && (
                        <Loader2 size={16} className="animate-spin text-warning-400" />
                      )}
                      {fieldStatuses.chargeDt === 'success' && (
                        <CheckCircle size={16} className="text-success-400" />
                      )}
                      {fieldStatuses.chargeDt === 'error' && (
                        <AlertCircle size={16} className="text-error-400" />
                      )}
                    </div>
                  )}
                </div>
                <span className="text-xs text-white/50 mt-1">
                  {claim.charge_dt ? `DB value: ${new Date(claim.charge_dt).toLocaleDateString()}` : 'No date in database'}
                </span>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-white/80 mb-2 font-medium">
                Charge Amount <span className="text-error-400">*</span>
              </label>
              <div className="relative">
                <input
                  name="chargeAmount"
                  type="number"
                  step="0.01"
                  value={claimDetailsForm.chargeAmount}
                  onChange={handleClaimDetailsChange}
                  className={`glass-input w-full
                    ${fieldStatuses.chargeAmount === 'loading' ? 'border-warning-500/50' : ''}
                    ${fieldStatuses.chargeAmount === 'success' ? 'border-success-500/50' : ''}
                    ${fieldStatuses.chargeAmount === 'error' ? 'border-error-500/50' : ''}
                  `}
                  required
                />
                {fieldStatuses.chargeAmount && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    {fieldStatuses.chargeAmount === 'loading' && (
                      <Loader2 size={16} className="animate-spin text-warning-400" />
                    )}
                    {fieldStatuses.chargeAmount === 'success' && (
                      <CheckCircle size={16} className="text-success-400" />
                    )}
                    {fieldStatuses.chargeAmount === 'error' && (
                      <AlertCircle size={16} className="text-error-400" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Primary Insurance Form */}
      {activeTab === 'primary' && claimDetailsComplete && (
        <GlassCard>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="text-accent-400" size={20} />
              Primary Insurance
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassInput
              label="Primary Insurance"
              name="primIns"
              value={primaryForm.primIns}
              onChange={handlePrimaryChange}
              status={fieldStatuses.primIns}
            />
            <GlassInput
              label="Primary Amount"
              name="primAmt"
              type="number"
              step="0.01"
              value={primaryForm.primAmt}
              onChange={handlePrimaryChange}
              status={fieldStatuses.primAmt}
            />
            <GlassInput
              label="Primary Post Date"
              name="primPostDt"
              type="date"
              value={formatDateForInput(primaryForm.primPostDt)}
              onChange={handlePrimaryChange}
              status={fieldStatuses.primPostDt}
            />
            <GlassInput
              label="Primary Check Details"
              name="primChkDetails"
              value={primaryForm.primChkDetails}
              onChange={handlePrimaryChange}
              status={fieldStatuses.primChkDetails}
            />
            <GlassInput
              label="Primary Received Date"
              name="primRecDt"
              type="date"
              value={formatDateForInput(primaryForm.primRecDt)}
              onChange={handlePrimaryChange}
              status={fieldStatuses.primRecDt}
            />
            <GlassInput
              label="Primary Check Amount"
              name="primChkAmt"
              type="number"
              step="0.01"
              value={primaryForm.primChkAmt}
              onChange={handlePrimaryChange}
              status={fieldStatuses.primChkAmt}
            />
            <div className="md:col-span-2">
              <label className="block text-white/80 mb-2 font-medium">
                Primary Comment
              </label>
              <textarea
                name="primCmnt"
                value={primaryForm.primCmnt}
                onChange={handlePrimaryChange}
                className="glass-input w-full min-h-[120px]"
              ></textarea>
            </div>
            <GlassInput
              label="Primary Denial Code"
              name="primDenialCode"
              value={primaryForm.primDenialCode}
              onChange={handlePrimaryChange}
            />
          </div>
        </GlassCard>
      )}

      {/* Secondary Insurance Form */}
      {activeTab === 'secondary' && claimDetailsComplete && (
        <GlassCard>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="text-accent-400" size={20} />
              Secondary Insurance
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassInput
              label="Secondary Insurance"
              name="secIns"
              value={secondaryForm.secIns}
              onChange={handleSecondaryChange}
              status={fieldStatuses.secIns}
            />
            <GlassInput
              label="Secondary Amount"
              name="secAmt"
              type="number"
              step="0.01"
              value={secondaryForm.secAmt}
              onChange={handleSecondaryChange}
              status={fieldStatuses.secAmt}
            />
            <GlassInput
              label="Secondary Post Date"
              name="secPostDt"
              type="date"
              value={formatDateForInput(secondaryForm.secPostDt)}
              onChange={handleSecondaryChange}
              status={fieldStatuses.secPostDt}
            />
            <GlassInput
              label="Secondary Check Details"
              name="secChkDetails"
              value={secondaryForm.secChkDetails}
              onChange={handleSecondaryChange}
              status={fieldStatuses.secChkDetails}
            />
            <GlassInput
              label="Secondary Received Date"
              name="secRecDt"
              type="date"
              value={formatDateForInput(secondaryForm.secRecDt)}
              onChange={handleSecondaryChange}
              status={fieldStatuses.secRecDt}
            />
            <GlassInput
              label="Secondary Check Amount"
              name="secChkAmt"
              type="number"
              step="0.01"
              value={secondaryForm.secChkAmt}
              onChange={handleSecondaryChange}
              status={fieldStatuses.secChkAmt}
            />
            <div className="md:col-span-2">
              <label className="block text-white/80 mb-2 font-medium">
                Secondary Comment
              </label>
              <textarea
                name="secCmnt"
                value={secondaryForm.secCmnt}
                onChange={handleSecondaryChange}
                className="glass-input w-full min-h-[120px]"
              ></textarea>
            </div>
            <GlassInput
              label="Patient Amount"
              name="patAmt"
              type="number"
              step="0.01"
              value={secondaryForm.patAmt}
              onChange={handleSecondaryChange}
              status={fieldStatuses.patAmt}
            />
            <GlassInput
              label="Patient Received Date"
              name="patRecDt"
              type="date"
              value={formatDateForInput(secondaryForm.patRecDt)}
              onChange={handleSecondaryChange}
              status={fieldStatuses.patRecDt}
            />
            <GlassInput
              label="Secondary Denial Code"
              name="secDenialCode"
              value={secondaryForm.secDenialCode}
              onChange={handleSecondaryChange}
              status={fieldStatuses.secDenialCode}
            />
          </div>
        </GlassCard>
      )}

      {/* Placeholder for incomplete claim details */}
      {(activeTab === 'primary' || activeTab === 'secondary') && !claimDetailsComplete && (
        <GlassCard className="bg-dark-400/50">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle size={48} className="text-warning-400 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Complete Claim Details First</h3>
            <p className="text-white/60 max-w-md">
              Please fill in and save all required fields in the Claim Details tab before accessing this section.
            </p>
            <Button
              variant="secondary"
              className="mt-6"
              onClick={() => setActiveTab('claim')}
            >
              Go to Claim Details
            </Button>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(ClaimTabs);