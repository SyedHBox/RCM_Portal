import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { VisitClaim, KPIData, SearchFilters } from '../types/claim';
import { fetchClaims, fetchClaimById, updateClaim as updateClaimAPI } from '../services/claimService';
import { useAuth } from './AuthContext';

// Mock KPI data for demonstration
const mockKPIData: KPIData = {
  totalCheckNumbers: 5,
  totalVisitIds: 5,
  postedVisitIds: 3,
  pendingPosting: 2
};

interface ClaimContextType {
  claims: VisitClaim[];
  kpiData: KPIData;
  searchResults: VisitClaim[];
  currentClaim: VisitClaim | null;
  isLoading: boolean;
  error: string | null;
  searchClaims: (filters: SearchFilters) => void;
  getClaim: (id: string) => Promise<VisitClaim | null>;
  updateClaim: (updatedClaimData: Partial<VisitClaim>) => Promise<VisitClaim | null>;
  addNote: (claimId: string, note: string) => void;
}

const ClaimContext = createContext<ClaimContextType | undefined>(undefined);

// Helper function to map API data to VisitClaim interface
const mapApiClaimToVisitClaim = (apiClaim: any): VisitClaim => {
  // Ensure apiClaim is not null or undefined
  if (!apiClaim) {
    console.error('Received null or undefined API claim data');
    return {
      id: 0,
      patient_id: '',
      first_name: 'Unknown',
      last_name: 'Patient',
      claim_status: 'Error',
      patientId: '',
      patientName: 'Unknown Patient',
      visitId: 'Unknown',
      dob: '',
      dos: '',
      checkNumber: '',
      amount: 0,
      status: 'Error',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: []
    } as VisitClaim;
  }
  
  // Log the raw data for debugging
  console.log('Raw API claim data:', apiClaim);
  
  return {
    // New database fields
    id: apiClaim.id,
    patient_id: apiClaim.patient_id || '',
    patient_emr_no: apiClaim.patient_emr_no || null,
    cpt_id: apiClaim.cpt_id?.toString() || null,
    cpt_code: apiClaim.cpt_code || null,
    first_name: apiClaim.first_name || '',
    last_name: apiClaim.last_name || '',
    date_of_birth: apiClaim.date_of_birth || null,
    service_start: apiClaim.service_start || null,
    service_end: apiClaim.service_end || apiClaim.dos || null,
    claim_status: apiClaim.claim_status || 'Pending',
    claim_status_type: apiClaim.claim_status_type || null,
    icd_code: apiClaim.icd_code || null,
    provider_name: apiClaim.provider_name || null,
    units: apiClaim.units || null,
    
    // Claim & Billing Information
    oa_claim_id: apiClaim.oa_claim_id || null,
    oa_visit_id: apiClaim.oa_visit_id || null,
    charge_dt: apiClaim.charge_dt || null,
    charge_amt: apiClaim.charge_amt !== undefined && apiClaim.charge_amt !== null ? apiClaim.charge_amt : null,
    allowed_amt: apiClaim.allowed_amt !== undefined && apiClaim.allowed_amt !== null ? apiClaim.allowed_amt : null,
    allowed_add_amt: apiClaim.allowed_add_amt !== undefined && apiClaim.allowed_add_amt !== null ? apiClaim.allowed_add_amt : null,
    allowed_exp_amt: apiClaim.allowed_exp_amt !== undefined && apiClaim.allowed_exp_amt !== null ? apiClaim.allowed_exp_amt : null,
    total_amt: apiClaim.total_amt !== undefined && apiClaim.total_amt !== null ? apiClaim.total_amt : null,
    charges_adj_amt: apiClaim.charges_adj_amt !== undefined && apiClaim.charges_adj_amt !== null ? apiClaim.charges_adj_amt : null,
    write_off_amt: apiClaim.write_off_amt !== undefined && apiClaim.write_off_amt !== null ? apiClaim.write_off_amt : null,
    bal_amt: apiClaim.bal_amt !== undefined && apiClaim.bal_amt !== null ? apiClaim.bal_amt : null,
    reimb_pct: apiClaim.reimb_pct !== undefined && apiClaim.reimb_pct !== null ? apiClaim.reimb_pct : null,
    
    // Primary Insurance
    prim_ins: apiClaim.prim_ins || null,
    prim_amt: apiClaim.prim_amt !== undefined && apiClaim.prim_amt !== null ? apiClaim.prim_amt : null,
    prim_post_dt: apiClaim.prim_post_dt || null,
    prim_chk_det: apiClaim.prim_chk_det || null,
    prim_recv_dt: apiClaim.prim_recv_dt || null,
    prim_chk_amt: apiClaim.prim_chk_amt !== undefined && apiClaim.prim_chk_amt !== null ? apiClaim.prim_chk_amt : null,
    prim_cmt: apiClaim.prim_cmt || null,
    
    // Secondary Insurance
    sec_ins: apiClaim.sec_ins || null,
    sec_amt: apiClaim.sec_amt !== undefined && apiClaim.sec_amt !== null ? apiClaim.sec_amt : null,
    sec_post_dt: apiClaim.sec_post_dt || null,
    sec_chk_det: apiClaim.sec_chk_det || null,
    sec_recv_dt: apiClaim.sec_recv_dt || null,
    sec_chk_amt: apiClaim.sec_chk_amt !== undefined && apiClaim.sec_chk_amt !== null ? apiClaim.sec_chk_amt : null,
    sec_cmt: apiClaim.sec_cmt || null,
    sec_denial_code: apiClaim.sec_denial_code || null,
    
    // Patient Payment
    pat_amt: apiClaim.pat_amt !== undefined && apiClaim.pat_amt !== null ? apiClaim.pat_amt : null,
    pat_recv_dt: apiClaim.pat_recv_dt || null,
    
    // Legacy fields for backward compatibility
    visitId: apiClaim.oa_visit_id || `V${apiClaim.id}`, 
    patientId: apiClaim.patient_id?.toString() || '',
    patientName: `${apiClaim.first_name || ''} ${apiClaim.last_name || ''}`.trim() || 'Unknown Patient',
    dob: apiClaim.date_of_birth || '',
    dos: apiClaim.service_end || apiClaim.dos || '',
    checkNumber: apiClaim.prim_chk_det || apiClaim.sec_chk_det || '',
    amount: apiClaim.charge_amt || 0,
    status: apiClaim.claim_status || 'Pending',
    createdAt: apiClaim.charge_dt || new Date().toISOString(),
    updatedAt: apiClaim.prim_post_dt || apiClaim.sec_post_dt || new Date().toISOString(),
    notes: [] // API data doesn't include notes field
  };
};

export const ClaimProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [claims, setClaims] = useState<VisitClaim[]>([]);
  const [kpiData] = useState<KPIData>(mockKPIData);
  const [searchResults, setSearchResults] = useState<VisitClaim[]>([]);
  const [currentClaim, setCurrentClaim] = useState<VisitClaim | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState<boolean>(false);

  // Optimized claims initial load with proper connection handling
  useEffect(() => {
    // Only load claims once, prevent multiple refreshes
    if (initialLoadDone) return;
    
    const controller = new AbortController(); // For cancelling the fetch if component unmounts
    
    const loadInitialClaims = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Attempting to load initial claims data');
        const response = await fetchClaims();
        
        if (response.success && Array.isArray(response.data)) {
          const mappedClaims = response.data.map(mapApiClaimToVisitClaim);
          console.log('Successfully mapped claims data:', mappedClaims);
          setClaims(mappedClaims);
          setSearchResults(mappedClaims);
          console.log('Successfully loaded claims:', mappedClaims.length);
        } else {
          console.error('Failed to fetch claims:', response.error || 'Unknown error', response);
          setError(response.message || 'Failed to fetch claims');
          // Use empty arrays instead of setting to null or undefined
          setClaims([]);
          setSearchResults([]);
        }
        // Mark initial load as complete regardless of success/failure
        setInitialLoadDone(true);
      } catch (err: any) {
        const errorMessage = 'Error connecting to the claims API';
        setError(errorMessage);
        console.error(errorMessage, err);
        // Use empty arrays instead of setting to null or undefined
        setClaims([]);
        setSearchResults([]);
        // Mark initial load as complete even on error
        setInitialLoadDone(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialClaims();
    
    // Cleanup function to abort any ongoing fetch when component unmounts
    return () => {
      controller.abort();
    };
  }, [initialLoadDone]); // Only depends on initialLoadDone flag

  // Debounce search function to prevent rapid consecutive API calls
  const searchClaims = useCallback(async (filters: SearchFilters) => {
    // If we're already in a loading state, don't trigger another search
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Searching claims with filters:', filters);

      // Create a filtered version without empty strings
      const cleanedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== undefined && value !== null) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);
      
      console.log('Cleaned filters for API call:', cleanedFilters);
      
      // Use the cleaned filters for the API call
      const response = await fetchClaims(cleanedFilters);
      
      if (response.success && Array.isArray(response.data)) {
        const mappedClaims = response.data.map(mapApiClaimToVisitClaim);
        setSearchResults(mappedClaims);
        console.log('Successfully searched claims:', mappedClaims.length);
      } else {
        console.error('Failed to search claims:', response.error || 'Unknown error');
        setError(response.message || 'Failed to search claims');
        setSearchResults([]);
      }
    } catch (err: any) {
      const errorMessage = 'Error searching claims';
      setError(errorMessage);
      console.error(errorMessage, err);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Use local cache for claim fetching when possible
  const getClaim = useCallback(async (id: string): Promise<VisitClaim | null> => {
    // If we're already in a loading state, avoid duplicate fetching
    if (isLoading) return currentClaim;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to find claim in existing claims first (try both as string and number)
      const numericId = parseInt(id, 10);
      
      // Check in the search results first, which may have more recent data
      let claim = searchResults.find(c => c.id === numericId || c.id.toString() === id);
      
      // Then check in all claims
      if (!claim) {
        claim = claims.find(c => c.id === numericId || c.id.toString() === id);
      }
      
      // If not found, fetch from API
      if (!claim) {
        console.log(`Claim with ID ${id} not found locally, fetching from API`);
        const response = await fetchClaimById(id);
        
        if (response.success && response.data) {
          claim = mapApiClaimToVisitClaim(response.data);
          console.log('Successfully fetched claim:', claim.id);
          
          // Add to claims array to ensure it's available for future lookups
          setClaims(prevClaims => {
            // Make sure we don't add duplicates
            if (!prevClaims.some(c => c.id === claim?.id)) {
              return [...prevClaims, claim as VisitClaim];
            }
            return prevClaims;
          });
        } else {
          console.error('Failed to fetch claim:', response.error || 'Unknown error');
          setError(response.message || `Failed to fetch claim with ID: ${id}`);
        }
      } else {
        console.log(`Found claim with ID ${id} in local state`);
      }
      
      setCurrentClaim(claim || null);
      return claim || null;
    } catch (err: any) {
      const errorMessage = `Failed to fetch claim with ID: ${id}`;
      setError(errorMessage);
      console.error(errorMessage, err);
      setCurrentClaim(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, claims, currentClaim, searchResults]);

  // Helper function to ensure dates are properly formatted before sending to API
  const formatDateFields = useCallback((data: any) => {
    const dateFields = ['charge_dt', 'prim_post_dt', 'prim_recv_dt', 'sec_post_dt', 'sec_recv_dt', 'pat_recv_dt'];
    const formattedData = { ...data };
    
    dateFields.forEach(field => {
      // Check if the field exists and is not empty
      if (formattedData[field]) {
        // Ensure it's in YYYY-MM-DD format
        try {
          const date = new Date(formattedData[field]);
          if (!isNaN(date.getTime())) {
            formattedData[field] = date.toISOString().split('T')[0];
          }
        } catch (e) {
          console.warn(`Could not format date field ${field}:`, e);
        }
      }
    });
    
    return formattedData;
  }, []);

  // Optimized update function with improved error handling to ensure edits are saved
  const updateClaim = useCallback(async (updatedClaimData: Partial<VisitClaim>): Promise<VisitClaim | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // We need the current claim to merge with the updates
      if (!currentClaim) {
        throw new Error('No current claim selected to update');
      }
      
      console.log('Updating claim with data:', updatedClaimData);
      
      // Format dates to YYYY-MM-DD
      const formattedData = formatDateFields(updatedClaimData);
      
      // Add user information to identify who made the changes
      // Ensure we pass the correct user info, especially for admin accounts
      const claimWithUserInfo = {
        ...formattedData,
        user_id: user?.id || 1,
        username: user?.name || (user?.role === 'Admin' ? 'Admin' : 'System')
      };
      
      console.log('About to call updateClaimAPI with data:', claimWithUserInfo);
      
      // Apply optimistic update first for better user experience
      const optimisticClaim = {
        ...currentClaim,
        ...formattedData,
        updatedAt: new Date().toISOString() // Add timestamp of the update
      };
      
      // Update the current claim immediately
      setCurrentClaim(optimisticClaim);
      
      // Update in the local lists as well
      setClaims(prevClaims => 
        prevClaims.map(c => c.id === currentClaim.id ? optimisticClaim : c)
      );
      
      setSearchResults(prevResults => 
        prevResults.map(c => c.id === currentClaim.id ? optimisticClaim : c)
      );
      
      // Call the API to update the claim with 3 retries if it fails
      let retryCount = 0;
      let response = null;
      
      while (retryCount < 3 && !response) {
        try {
          response = await updateClaimAPI(currentClaim.id.toString(), claimWithUserInfo, 3);
          break;
        } catch (err) {
          retryCount++;
          console.log(`API attempt ${retryCount} failed. Retrying...`);
          
          // Wait a bit between retries
          if (retryCount < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      if (!response) {
        console.error('No response received from updateClaimAPI after multiple attempts');
        // Still use the optimistic update data but show an error
        setError('Changes saved locally but server sync failed. Please try again later.');
        return optimisticClaim;
      }
      
      console.log('API response received:', response);
      
      if (response.success && response.data) {
        console.log('Claim updated successfully in database:', response.data);
        
        // Map the API response to our VisitClaim model
        const mappedClaim = mapApiClaimToVisitClaim(response.data);
        
        // Update the current claim with the server response
        setCurrentClaim(mappedClaim);
        
        // Update in the local lists as well with the server data
        setClaims(prevClaims => 
          prevClaims.map(c => c.id === currentClaim.id ? mappedClaim : c)
        );
        
        setSearchResults(prevResults => 
          prevResults.map(c => c.id === currentClaim.id ? mappedClaim : c)
        );
        
        setIsLoading(false);
        return mappedClaim;
      } else {
        throw new Error(response.message || 'Failed to update claim');
      }
    } catch (error) {
      console.error('Error updating claim:', error);
      setError(`Failed to update claim: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
      return null;
    }
  }, [currentClaim, user, setCurrentClaim, setClaims, setSearchResults, setIsLoading, setError]);

  const addNote = useCallback((claimId: string, note: string) => {
    if (currentClaim && currentClaim.id === parseInt(claimId, 10)) {
      const updatedClaim = {
        ...currentClaim,
        notes: currentClaim.notes ? [...currentClaim.notes, note] : [note],
        updatedAt: new Date().toISOString()
      };
      setCurrentClaim(updatedClaim);
      
      // Also update in lists
      setClaims(prevClaims => 
        prevClaims.map(c => c.id === updatedClaim.id ? updatedClaim : c)
      );
      
      setSearchResults(prevResults => 
        prevResults.map(c => c.id === updatedClaim.id ? updatedClaim : c)
      );
    }
  }, [currentClaim]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    claims,
    kpiData,
    searchResults,
    currentClaim,
    isLoading,
    error,
    searchClaims,
    getClaim,
    updateClaim,
    addNote
  }), [
    claims, 
    kpiData, 
    searchResults, 
    currentClaim, 
    isLoading, 
    error, 
    searchClaims, 
    getClaim, 
    updateClaim, 
    addNote
  ]);

  return (
    <ClaimContext.Provider value={contextValue}>
      {children}
    </ClaimContext.Provider>
  );
};

export const useClaims = (): ClaimContextType => {
  const context = useContext(ClaimContext);
  if (context === undefined) {
    throw new Error('useClaims must be used within a ClaimProvider');
  }
  return context;
};
