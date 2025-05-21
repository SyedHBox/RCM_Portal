import React, { useState } from 'react';
import { SearchFilters } from '../../types/claim';
import { useClaims } from '../../contexts/ClaimContext';

// Updated icons to match login page style with white color and glow
const PatientIdIcon = () => (
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
    className="text-white/80"
    style={{ filter: "drop-shadow(0 0 2px rgba(255, 255, 255, 0.5))" }}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M22 12h-6"></path>
  </svg>
);

const CptIdIcon = () => (
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
    className="text-white/80"
    style={{ filter: "drop-shadow(0 0 2px rgba(255, 255, 255, 0.5))" }}
  >
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path>
    <rect x="9" y="3" width="6" height="4" rx="2"></rect>
    <path d="M9 14h.01"></path>
    <path d="M13 14h.01"></path>
    <path d="M9 18h.01"></path>
    <path d="M13 18h.01"></path>
  </svg>
);

const CalendarIcon = () => (
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
    className="text-white/80"
    style={{ filter: "drop-shadow(0 0 2px rgba(255, 255, 255, 0.5))" }}
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const SearchIcon = () => (
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
    className="text-white/80"
    style={{ filter: "drop-shadow(0 0 2px rgba(255, 255, 255, 0.5))" }}
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

// Sample CPT IDs for autocomplete
const sampleCptIds = ['170916', 'CPT6249', 'P00234', '11030'];

interface SearchFormProps {
  onShowAllClick?: () => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ onShowAllClick }) => {
  const { searchClaims, isLoading } = useClaims();
  const [filters, setFilters] = useState<SearchFilters>({
    patientId: '',
    cptId: '',
    dos: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    console.log(`Search field ${name} changed to: ${value}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search form submitted with filters:', filters);
    searchClaims(filters);
  };

  const handleClear = () => {
    console.log('Clearing search form');
    setFilters({
      patientId: '',
      cptId: '',
      dos: '',
    });
  };

  return (
    <div className="mb-8">
      <form onSubmit={handleSubmit} className="glass-card-dark p-6 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-white/80 mb-2 font-medium">
              Patient ID
            </label>
            <div className="relative">
              <div 
                className="absolute left-3 top-1/2 z-10" 
                style={{
                  transform: 'translateY(-50%)',
                  filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.4))'
                }}
              >
                <PatientIdIcon />
              </div>
              <input
                name="patientId"
                placeholder="Enter patient ID"
                value={filters.patientId}
                onChange={handleChange}
                className="glass-input w-full pl-12 bg-transparent border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500/50 backdrop-blur-sm transition-colors"
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                  color: '#ffffff'
                }}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-white/80 mb-2 font-medium">
              CPT ID
            </label>
            <div className="relative">
              <div 
                className="absolute left-3 top-1/2 z-10" 
                style={{
                  transform: 'translateY(-50%)',
                  filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.4))'
                }}
              >
                <CptIdIcon />
              </div>
              <input
                name="cptId"
                placeholder="Enter CPT ID"
                value={filters.cptId}
                onChange={handleChange}
                list="cptIdOptions"
                className="glass-input w-full pl-12 bg-transparent border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500/50 backdrop-blur-sm transition-colors"
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                  color: '#ffffff'
                }}
              />
              <datalist id="cptIdOptions">
                {sampleCptIds.map((id) => (
                  <option key={id} value={id} className="bg-dark-300 text-white" />
                ))}
              </datalist>
            </div>
          </div>
          
          <div>
            <label className="block text-white/80 mb-2 font-medium">
              Date of Service (DOS)
            </label>
            <div className="relative">
              <div 
                className="absolute left-3 top-1/2 z-10" 
                style={{
                  transform: 'translateY(-50%)',
                  filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.4))'
                }}
              >
                <CalendarIcon />
              </div>
              <input
                type="date"
                name="dos"
                placeholder="Select a date"
                value={filters.dos}
                onChange={handleChange}
                className="glass-input w-full pl-12 bg-transparent border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500/50 backdrop-blur-sm transition-colors"
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                  color: '#ffffff'
                }}
              />
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-end gap-4 mt-6">
          <button 
            type="button" 
            onClick={handleClear}
            className="flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-white bg-transparent border border-white/10 hover:bg-white/5 backdrop-blur-md transition-colors"
            style={{
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
            }}
          >
            Clear
          </button>
          
          <button 
            type="submit"
            className="flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-white bg-transparent border border-white/10 hover:bg-white/5 backdrop-blur-md transition-colors"
            style={{
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <SearchIcon />
            )}
            Search
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchForm;
