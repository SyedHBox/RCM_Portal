import React from 'react';
import { AlertCircle } from 'lucide-react';
import { VisitClaim } from '../../types/claim';
import { Link } from 'react-router-dom';

interface SearchResultsProps {
  results: VisitClaim[];
  isLoading: boolean;
  hasSearched: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  results, 
  isLoading,
  hasSearched
}) => {
  // Format date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Determine status display style based on the status
  const getStatusDisplayStyle = (status: string | undefined) => {
    if (!status) return 'bg-gray-600/30 text-white/70';
    
    switch (status) {
      case 'Insurance Paid':
      case 'Claim not filed':
      case 'Posted':
        return 'bg-success-500/20 text-success-300';
      case 'Prim Denied':
      case 'Sec Denied. Prim Paid more than Allowed amt':
      case 'Patient Deceased':
      case 'Rejected':
        return 'bg-error-500/20 text-error-300';
      case 'Prim Pymt Pending':
      case 'Sec Pymt Pending':
      case 'Claim not received from HBox':
      case 'Pending':
        return 'bg-warning-500/20 text-warning-300';
      default:
        return 'bg-info-500/20 text-info-300';
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card-dark min-h-48 flex items-center justify-center rounded-xl">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Searching for claims...</p>
        </div>
      </div>
    );
  }

  if (hasSearched && results.length === 0) {
    return (
      <div className="glass-card-dark min-h-48 flex items-center justify-center rounded-xl">
        <div className="text-center text-white/70">
          <AlertCircle className="h-10 w-10 mx-auto mb-4 text-white/40" />
          <h3 className="text-lg font-medium mb-1">No results found</h3>
          <p>Try adjusting your search parameters</p>
          <p className="mt-3 text-xs text-white/50">Check that your backend server is running at http://localhost:5000</p>
        </div>
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div className="glass-card-dark min-h-48 flex items-center justify-center rounded-xl">
        <div className="text-center text-white/70">
          <Search className="h-10 w-10 mx-auto mb-4 text-white/40" />
          <h3 className="text-lg font-medium mb-1">Search for claims</h3>
          <p>Use the form above to find specific claims</p>
        </div>
      </div>
    );
  }

  console.log('Rendering search results:', results);

  return (
    <div className="space-y-4">
      {results.map((claim) => (
        <div key={claim.id} className="glass-card-dark rounded-xl overflow-hidden">
          <div className="p-4">
            {/* Patient Name */}
            <div className="mb-4">
              <h3 className="text-xl font-medium text-white">{claim.first_name} {claim.last_name}</h3>
            </div>
            
            {/* Three columns of data */}
            <div className="grid grid-cols-3 mb-3 gap-4">
              <div>
                <div className="mb-2">
                  <p className="text-white/50 text-xs uppercase tracking-wider font-medium">Patient ID</p>
                  <p className="text-white">{claim.patient_id}</p>
                </div>
                <div>
                  <p className="text-white/50 text-xs uppercase tracking-wider font-medium">Date of Birth</p>
                  <p className="text-white">{formatDate(claim.date_of_birth)}</p>
                </div>
              </div>
              
              <div>
                <div className="mb-2">
                  <p className="text-white/50 text-xs uppercase tracking-wider font-medium">CPT ID</p>
                  <p className="text-white">{claim.cpt_id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-white/50 text-xs uppercase tracking-wider font-medium">Date of Service</p>
                  <p className="text-white">{formatDate(claim.service_end)}</p>
                </div>
              </div>
              
              <div>
                <div className="mb-2">
                  <p className="text-white/50 text-xs uppercase tracking-wider font-medium">CPT Code</p>
                  <p className="text-accent-400 font-medium">{claim.cpt_code || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-white/50 text-xs uppercase tracking-wider font-medium">Claim Status</p>
                  <span className={`inline-block px-2 py-0.5 rounded text-sm ${getStatusDisplayStyle(claim.claim_status)}`}>
                    {claim.claim_status || 'Not Set'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* View Details link */}
            <div className="text-right">
              <Link 
                to={`/profile/${claim.id}`} 
                className="text-accent-400 hover:text-accent-300 text-sm flex items-center justify-end gap-1"
              >
                View Details
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Search icon component for initial state
const Search: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export default SearchResults;
