import React, { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Eye } from 'lucide-react';
import { VisitClaim } from '../../types/claim';
import GlassCard from '../ui/GlassCard';
import { Link } from 'react-router-dom';

interface RecentClaimsProps {
  claims: VisitClaim[];
}

const tableVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const rowVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  hover: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    transition: { duration: 0.2 }
  }
};

const RecentClaims: React.FC<RecentClaimsProps> = ({ claims }) => {
  // Memoize the claims to prevent unnecessary re-renders
  const displayClaims = useMemo(() => claims.slice(0, 10), [claims]);
  
  // Format date function
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GlassCard className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <motion.h2 
            className="text-xl font-semibold flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            Recent Claims
            <motion.span 
              className="ml-2 bg-accent-500/30 text-accent-300 text-xs px-2 py-1 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.4 }}
            >
              {displayClaims.length}
            </motion.span>
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              to="/search" 
              className="text-accent-400 text-sm hover:text-accent-300 transition-colors flex items-center gap-1"
            >
              View All 
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ 
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 1,
                  repeatDelay: 0.5
                }}
              >
                <ChevronRight size={16} />
              </motion.div>
            </Link>
          </motion.div>
        </div>
        
        <div className="overflow-x-auto">
          <AnimatePresence>
            {displayClaims.length > 0 ? (
              <motion.table 
                className="min-w-full divide-y divide-white/10"
                variants={tableVariants}
                initial="hidden"
                animate="visible"
              >
                <thead className="text-white/70">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium tracking-wider">
                      Visit ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium tracking-wider">
                      Patient
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium tracking-wider">
                      Date of Service
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {displayClaims.map((claim, index) => (
                    <motion.tr 
                      key={claim.id}
                      variants={rowVariants}
                      whileHover="hover"
                      custom={index}
                      layoutId={`claim-row-${claim.id}`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        {claim.visitId}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {claim.patientName}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {formatDate(claim.dos || '')}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        ${(claim.amount || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <motion.span 
                          className={`px-2 py-1 rounded-full text-xs inline-flex items-center
                            ${claim.status === 'Posted' ? 'bg-success-900/30 text-success-400' : ''}
                            ${claim.status === 'Pending' ? 'bg-warning-900/30 text-warning-400' : ''}
                            ${claim.status === 'Rejected' ? 'bg-error-900/30 text-error-400' : ''}
                          `}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.05 + 0.2 }}
                        >
                          {claim.status}
                        </motion.span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Link 
                            to={`/profile/${claim.id}`}
                            className="text-accent-400 hover:text-accent-300 transition-colors flex items-center gap-1 justify-end"
                          >
                            <Eye size={14} />
                            View
                          </Link>
                        </motion.div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </motion.table>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-white/60"
              >
                No recent claims found.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </GlassCard>
    </motion.div>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(RecentClaims);
