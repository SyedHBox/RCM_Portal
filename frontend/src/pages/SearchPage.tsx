import React, { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import SearchForm from '../components/search/SearchForm';
import SearchResults from '../components/search/SearchResults';
import { useClaims } from '../contexts/ClaimContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SearchPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { searchResults, isLoading, searchClaims, claims } = useClaims();
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();
  
  // Add console log to debug navigation
  useEffect(() => {
    console.log('SearchPage: Component mounted');
    console.log('SearchPage: Auth state -', { isAuthenticated, authLoading });
    
    // Only redirect if not authenticated and not currently checking authentication
    if (!isAuthenticated && !authLoading) {
      console.log('SearchPage: Not authenticated, redirecting to login');
      navigate('/login');
    } else if (isAuthenticated) {
      console.log('SearchPage: Authentication confirmed');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Track when a search happens
  useEffect(() => {
    if (isLoading) {
      setHasSearched(true);
    }
  }, [isLoading]);

  // Show loading indicator during authentication check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-300 to-dark-400 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-transparent border-t-accent-400 border-r-accent-400 rounded-full animate-spin"></div>
          <p className="mt-4 text-white/80">Verifying your session...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!isAuthenticated) return null;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-300 to-dark-400">
      <Header />
      
      <div className="container mx-auto pt-24 pb-12 px-4 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Search Claims</h1>
          <p className="text-white/60 mt-2">
            Find billing claims using multiple search parameters
          </p>
        </div>
        
        <SearchForm />
        <SearchResults 
          results={searchResults} 
          isLoading={isLoading}
          hasSearched={hasSearched}
        />
      </div>
    </div>
  );
};

export default SearchPage;
