import { Request, Response } from 'express';
import pool, { query } from '../config/db';
import Claim from '../models/Claim';
import ChangeLog from '../models/ChangeLog';

// Request counter to track API usage
let requestCounter = 0;
// Cache to avoid repeated identical queries
const queryCache: Record<string, {
  data: any; 
  timestamp: number;
  ttl: number;
}> = {};

/**
 * Get claims with optional filtering
 * @route GET /api/claims
 */
export const getClaims = async (req: Request, res: Response) => {
  try {
    requestCounter++;
    const requestId = requestCounter;
    
    // Only log every 5th request to reduce console spam
    const shouldLog = requestId % 5 === 0;
    if (shouldLog) {
      console.log(`[Request #${requestId}] GET /api/claims received with query params:`, req.query);
    }

    // Extract query parameters
    const patientId = req.query.patient_id ? Number(req.query.patient_id) : undefined;
    const cptId = req.query.cpt_id ? Number(req.query.cpt_id) : undefined;
    const serviceEnd = req.query.service_end as string | undefined;

    // Build query components
    let sqlQuery = `
      SELECT
        id, patient_id, patient_emr_no, cpt_id, cpt_code, 
        first_name, last_name, date_of_birth, service_start, service_end,
        icd_code, provider_name, units, oa_claim_id, oa_visit_id,
        charge_dt, charge_amt, allowed_amt, allowed_add_amt, allowed_exp_amt,
        total_amt, charges_adj_amt, write_off_amt, bal_amt, reimb_pct,
        claim_status, claim_status_type, prim_ins, prim_amt, prim_post_dt,
        prim_chk_det, prim_recv_dt, prim_chk_amt, prim_cmt, sec_ins,
        sec_amt, sec_post_dt, sec_chk_det, sec_recv_dt, sec_chk_amt, sec_cmt,
        pat_amt, pat_recv_dt
      FROM upl_billing_reimburse`;
    const queryParams: any[] = [];
    const conditions: string[] = [];

    // Add filters if provided
    if (patientId) {
      queryParams.push(patientId);
      conditions.push(`patient_id = $${queryParams.length}`);
    }

    if (cptId) {
      queryParams.push(cptId);
      conditions.push(`cpt_id = $${queryParams.length}`);
    }

    if (serviceEnd) {
      queryParams.push(serviceEnd);
      conditions.push(`service_end = $${queryParams.length}`);
    }

    // Construct WHERE clause if there are conditions
    if (conditions.length > 0) {
      sqlQuery += ' WHERE ' + conditions.join(' AND ');
    }

    // Sort by most recent service date with nulls last
    sqlQuery += ' ORDER BY service_end DESC NULLS LAST';

    // Add LIMIT for pagination and performance
    sqlQuery += ' LIMIT 10';

    // Create a cache key based on the query and params
    const cacheKey = JSON.stringify({ sql: sqlQuery, params: queryParams });
    const now = Date.now();
    
    // Check if we have this query in cache and it's still valid (less than 30 seconds old)
    if (queryCache[cacheKey] && now - queryCache[cacheKey].timestamp < queryCache[cacheKey].ttl) {
      if (shouldLog) console.log(`[Request #${requestId}] Using cached result for claims query`);
      return res.status(200).json(queryCache[cacheKey].data);
    }

    if (shouldLog) {
      console.log(`[Request #${requestId}] Executing SQL query:`, sqlQuery.replace(/\s+/g, ' '));
      console.log(`[Request #${requestId}] With parameters:`, queryParams);
    }

    // Execute query using our optimized query function
    try {
      const { rows } = await query(sqlQuery, queryParams);
      
      if (shouldLog) console.log(`[Request #${requestId}] Query returned ${rows.length} claims`);
      
      const result = {
        success: true,
        data: rows
      };
      
      // Cache the result with a TTL of 30 seconds
      queryCache[cacheKey] = {
        data: result,
        timestamp: now,
        ttl: 30000 // 30 seconds
      };
      
      return res.status(200).json(result);
    } catch (dbError) {
      console.error(`[Request #${requestId}] Database query error:`, dbError);
      
      // Return a detailed error for debugging
      return res.status(500).json({
        success: false,
        error: 'Database query failed',
        message: dbError instanceof Error ? dbError.message : 'Unknown database error'
      });
    }
  } catch (error) {
    console.error('Error fetching claims:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve claims',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get claim by ID
 * @route GET /api/claims/:id
 */
export const getClaimById = async (req: Request, res: Response) => {
  try {
    requestCounter++;
    const requestId = requestCounter;
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid ID format',
        message: 'The ID must be a number'
      });
      return;
    }
    
    // Create cache key for this specific claim
    const cacheKey = `claim-${id}`;
    const now = Date.now();
    
    // Check if we have cached data for this claim (cache for 60 seconds)
    if (queryCache[cacheKey] && now - queryCache[cacheKey].timestamp < queryCache[cacheKey].ttl) {
      return res.status(200).json(queryCache[cacheKey].data);
    }
    
    // Query to get full claim details by ID
    const sqlQuery = `
      SELECT *
      FROM upl_billing_reimburse
      WHERE id = $1`;
    
    // Use our optimized query function
    const { rows } = await query(sqlQuery, [id]);
    
    if (rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Claim not found',
        message: `No claim found with ID: ${id}`
      });
      return;
    }
    
    // Prepare response
    const result = {
      success: true,
      data: rows[0]
    };
    
    // Cache the result with a TTL of 60 seconds
    queryCache[cacheKey] = {
      data: result,
      timestamp: now,
      ttl: 60000 // 60 seconds
    };
    
    // Return the claim
    res.status(200).json(result);
  } catch (error) {
    console.error(`Error fetching claim with ID ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve claim',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update claim by ID
 * @route PUT /api/claims/:id
 */
export const updateClaim = async (req: Request, res: Response) => {
  try {
    requestCounter++;
    const requestId = requestCounter;
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid ID format',
        message: 'The ID must be a number'
      });
      return;
    }

    // Get the current claim to check if it exists and to compare old values
    const checkQuery = `SELECT * FROM upl_billing_reimburse WHERE id = $1`;
    const checkResult = await query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Claim not found',
        message: `No claim found with ID: ${id}`
      });
      return;
    }

    const oldClaim = checkResult.rows[0];

    // Get the request body
    const updateData = req.body;
    
    // Build the SET part of the query dynamically
    const allowedFields = [
      'oa_claim_id', 'oa_visit_id', 'charge_dt', 
      'charge_amt', 'allowed_amt', 'allowed_add_amt', 'allowed_exp_amt',
      'prim_ins', 'prim_amt', 'prim_post_dt', 'prim_chk_det', 'prim_recv_dt', 'prim_chk_amt', 'prim_cmt',
      'sec_ins', 'sec_amt', 'sec_post_dt', 'sec_chk_det', 'sec_recv_dt', 'sec_chk_amt', 'sec_cmt', 'sec_denial_code',
      'pat_amt', 'pat_recv_dt', 'total_amt', 'charges_adj_amt', 'write_off_amt', 
      'bal_amt', 'reimb_pct', 'claim_status', 'claim_status_type'
    ];

    // Filter only allowed fields from request body
    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (field in updateData) {
        updates[field] = updateData[field];
      }
    }
    
    // If there's nothing to update, return early
    if (Object.keys(updates).length === 0) {
      res.status(400).json({
        success: false,
        error: 'No valid fields to update',
        message: 'Request must include at least one valid field to update'
      });
      return;
    }

    // Track changes for history
    const changesForHistory: Array<{
      field_name: string;
      old_value: string | null;
      new_value: string | null;
    }> = [];

    // Collect fields that changed for history tracking
    for (const [key, newValue] of Object.entries(updates)) {
      const oldValue = oldClaim[key as keyof Claim];
      
      // Only record changes if the values are actually different
      // Improve comparison to handle null/undefined/empty string cases
      const oldValueStr = oldValue !== null && oldValue !== undefined ? String(oldValue).trim() : '';
      const newValueStr = newValue !== null && newValue !== undefined ? String(newValue).trim() : '';
      
      if (oldValueStr !== newValueStr) {
        changesForHistory.push({
          field_name: key,
          old_value: oldValue !== null && oldValue !== undefined ? String(oldValue) : null,
          new_value: newValue !== null && newValue !== undefined ? String(newValue) : null
        });
      }
    }
    
    // Construct the SET clause and parameters
    const setClauses: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(updates)) {
      setClauses.push(`${key} = $${paramIndex}`);
      queryParams.push(value);
      paramIndex++;
    }
    
    // Add the ID as the last parameter
    queryParams.push(id);
    
    // Construct the full query
    const updateQuery = `
      UPDATE upl_billing_reimburse
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *`;
    
    // Execute the query to update the claim using our optimized query function
    console.log('Executing update query:', updateQuery);
    console.log('With parameters:', queryParams);
    
    const updateResult = await query(updateQuery, queryParams);
    
    if (updateResult.rows.length === 0) {
      console.error('Update query did not return any rows.');
      res.status(500).json({
        success: false,
        error: 'Failed to update claim',
        message: 'Update operation succeeded but no rows were returned'
      });
      return;
    }
    
    const updatedClaim = updateResult.rows[0];
    console.log('Claim updated successfully:', updatedClaim);

    // After successful update, invalidate any cached entries for this claim
    Object.keys(queryCache).forEach(key => {
      if (key === `claim-${id}` || key === `claim-history-${id}` || key.includes('claims')) {
        delete queryCache[key];
      }
    });

    // Only try to log changes if there are changes to log
    if (changesForHistory.length > 0) {
      // Ensure we properly extract user information with proper fallbacks
      // Make sure we prioritize user_id and username from the request body
      const userId = req.body.user_id !== undefined ? req.body.user_id : 1;
      const username = req.body.username || (userId !== 1 ? 'Admin' : 'System');
      
      console.log('Logging changes with user info:', { userId, username, changesCount: changesForHistory.length });
      console.log('Changes being logged:', changesForHistory);
      
      try {
        // Create a single batch insert statement for all changes instead of multiple queries
        if (changesForHistory.length > 0) {
          const valuesSql = changesForHistory.map((_, index) => {
            const offset = index * 8;
            return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, NOW(), $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8})`;
          }).join(', ');
          
          const logQuery = `
            INSERT INTO upl_change_logs (
              claim_id, user_id, username, cpt_id, 
              timestamp, field_name, old_value, new_value, action_type
            ) VALUES ${valuesSql}
            RETURNING id`;
          
          const logParams: any[] = [];
          changesForHistory.forEach(change => {
            logParams.push(
              id,
              userId,
              username,
              oldClaim.cpt_id || null,
              change.field_name,
              change.old_value,
              change.new_value,
              'updated'
            );
          });
          
          // Use a single query for all log entries
          await query(logQuery, logParams);
          console.log(`Created ${changesForHistory.length} change log entries for user ${username} (ID: ${userId})`);
        }
      } catch (logError: any) {
        // If the error is because the upl_change_logs table doesn't exist, just continue
        if (logError.code === '42P01') { // PostgreSQL code for "relation does not exist"
          console.log('upl_change_logs table does not exist, skipping history tracking');
        } else {
          // Log other errors but don't fail the operation
          console.error('Failed to create change logs:', logError);
        }
        // Continue with the response even if logging fails
      }
    }
    
    // Return the updated claim
    res.status(200).json({
      success: true,
      message: 'Claim updated successfully',
      data: updatedClaim
    });
    
  } catch (error) {
    console.error('Error updating claim:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update claim',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get change history for a claim
 * @route GET /api/claims/:id/history
 */
export const getClaimHistory = async (req: Request, res: Response) => {
  try {
    requestCounter++;
    const requestId = requestCounter;
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid ID format',
        message: 'The ID must be a number'
      });
      return;
    }
    
    // Create cache key for this specific claim's history
    const cacheKey = `claim-history-${id}`;
    const now = Date.now();
    
    // Check if we have cached data for this claim's history (cache for 2 minutes)
    if (queryCache[cacheKey] && now - queryCache[cacheKey].timestamp < queryCache[cacheKey].ttl) {
      return res.status(200).json(queryCache[cacheKey].data);
    }
    
    try {
      // Check if the claim exists
      const claimCheckQuery = 'SELECT id, cpt_id, first_name, last_name FROM upl_billing_reimburse WHERE id = $1';
      
      // Use our optimized query function
      const claimCheck = await query(claimCheckQuery, [id]);
      
      if (claimCheck.rows.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Claim not found',
          message: `No claim found with ID: ${id}`
        });
        return;
      }
      
      const claim = claimCheck.rows[0];
      
      try {
        // Get change history for the claim
        const historyQuery = `
          SELECT *
          FROM upl_change_logs
          WHERE claim_id = $1
          ORDER BY timestamp DESC`;
        
        // Use our optimized query function
        const historyResult = await query(historyQuery, [id]);
        const rows = historyResult.rows;
        
        // Prepare result
        const result = {
          success: true,
          data: rows
        };
        
        // Cache the result with a TTL of 2 minutes (120 seconds)
        queryCache[cacheKey] = {
          data: result,
          timestamp: now,
          ttl: 120000 // 2 minutes
        };
        
        res.status(200).json(result);
      } catch (dbError: any) {
        // If the error is because the upl_change_logs table doesn't exist, return mock data
        if (dbError.code === '42P01') { // PostgreSQL code for "relation does not exist"
          console.log(`upl_change_logs table doesn't exist yet, returning mock data for claim ${id}`);
          
          // Generate mock data for the history
          const mockHistory = [
            {
              id: 1,
              claim_id: id,
              user_id: 1,
              username: 'System',
              cpt_id: claim.cpt_id,
              timestamp: new Date().toISOString(),
              field_name: 'claim_status',
              old_value: 'Pending',
              new_value: 'Posted',
              action_type: 'updated',
              first_name: claim.first_name,
              last_name: claim.last_name
            }
          ];
          
          // Prepare result with mock data
          const result = {
            success: true,
            data: mockHistory,
            mock: true
          };
          
          // Cache the mock result
          queryCache[cacheKey] = {
            data: result,
            timestamp: now,
            ttl: 120000 // 2 minutes
          };
          
          res.status(200).json(result);
        } else {
          // Rethrow if it's not the "relation does not exist" error
          throw dbError;
        }
      }
    } catch (error) {
      console.error(`Error fetching history for claim ${id}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve claim history',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } catch (outerError) {
    console.error(`Error in getClaimHistory for claim ${req.params.id}:`, outerError);
    res.status(500).json({
      success: false,
      error: 'Failed to process request',
      message: outerError instanceof Error ? outerError.message : 'Unknown error'
    });
  }
};

/**
 * Get all change history
 * @route GET /api/history
 */
export const getAllChangeHistory = async (req: Request, res: Response) => {
  try {
    requestCounter++;
    const requestId = requestCounter;
    
    const userId = req.query.user_id ? parseInt(req.query.user_id as string) : undefined;
    const cptId = req.query.cpt_id ? parseInt(req.query.cpt_id as string) : undefined;
    const startDate = req.query.start_date as string | undefined;
    const endDate = req.query.end_date as string | undefined;
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '20');
    const offset = (page - 1) * limit;
    
    // Create a cache key for this specific query
    const cacheKey = `all-history-${userId || 'all'}-${cptId || 'all'}-${startDate || 'none'}-${endDate || 'none'}-${page}-${limit}`;
    const now = Date.now();
    
    // Check if we have cached data for this query (cache for 60 seconds)
    if (queryCache[cacheKey] && now - queryCache[cacheKey].timestamp < queryCache[cacheKey].ttl) {
      return res.status(200).json(queryCache[cacheKey].data);
    }

    try {
      // Build query conditions
      let conditions: string[] = [];
      const queryParams: any[] = [];
      let paramIndex = 1;

      if (userId) {
        conditions.push(`user_id = $${paramIndex++}`);
        queryParams.push(userId);
      }

      if (cptId) {
        conditions.push(`cpt_id = $${paramIndex++}`);
        queryParams.push(cptId);
      }

      if (startDate) {
        conditions.push(`timestamp >= $${paramIndex++}`);
        queryParams.push(startDate);
      }

      if (endDate) {
        conditions.push(`timestamp <= $${paramIndex++}`);
        queryParams.push(endDate);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Count total records for pagination
      const countQuery = `SELECT COUNT(*) FROM upl_change_logs ${whereClause}`;
      
      // Use our optimized query function
      const countResult = await query(countQuery, queryParams);
      const totalCount = parseInt(countResult.rows[0].count);

      // Get paginated history
      const historyQuery = `
        SELECT 
          cl.*,
          ubr.cpt_code,
          ubr.first_name,
          ubr.last_name
        FROM upl_change_logs cl
        LEFT JOIN upl_billing_reimburse ubr ON cl.claim_id = ubr.id
        ${whereClause}
        ORDER BY cl.timestamp DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;

      queryParams.push(limit, offset);
      
      // Use our optimized query function
      const historyResult = await query(historyQuery, queryParams);
      const rows = historyResult.rows;
      
      // Prepare result
      const result = {
        success: true,
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        data: rows
      };
      
      // Cache the result with a TTL of 60 seconds
      queryCache[cacheKey] = {
        data: result,
        timestamp: now,
        ttl: 60000 // 60 seconds
      };

      res.status(200).json(result);
    } catch (dbError: any) {
      // If the error is because the change_logs table doesn't exist, return mock data
      if (dbError.code === '42P01') { // PostgreSQL code for "relation does not exist"
        console.log(`upl_change_logs table doesn't exist yet, returning mock history data`);
        
        // Get some claims to generate mock history using our optimized query
        const claimsQuery = `SELECT id, cpt_id, first_name, last_name FROM upl_billing_reimburse LIMIT 5`;
        const claimsResult = await query(claimsQuery, []);
        const claims = claimsResult.rows;
        
        // Generate mock history data based on existing claims
        const mockHistory = claims.flatMap((claim, index) => {
          const date = new Date();
          date.setDate(date.getDate() - index); // Different days for variety
          
          return [
            {
              id: index * 2 + 1,
              claim_id: claim.id,
              user_id: userId || 1,
              username: 'System',
              cpt_id: claim.cpt_id,
              timestamp: date.toISOString(),
              field_name: 'claim_status',
              old_value: 'Pending',
              new_value: 'Posted',
              action_type: 'updated',
              cpt_code: `CPT${claim.id}`,
              first_name: claim.first_name,
              last_name: claim.last_name
            },
            {
              id: index * 2 + 2,
              claim_id: claim.id,
              user_id: userId || 1,
              username: 'System',
              cpt_id: claim.cpt_id,
              timestamp: new Date(date.setHours(date.getHours() - 2)).toISOString(),
              field_name: 'prim_ins',
              old_value: null,
              new_value: 'Medicare',
              action_type: 'updated',
              cpt_code: `CPT${claim.id}`,
              first_name: claim.first_name,
              last_name: claim.last_name
            }
          ];
        });
        
        // Apply any filters that were requested
        let filteredHistory = [...mockHistory];
        
        if (userId) {
          filteredHistory = filteredHistory.filter(h => h.user_id === userId);
        }
        
        if (cptId) {
          filteredHistory = filteredHistory.filter(h => h.cpt_id === cptId);
        }
        
        // Apply pagination
        const totalCount = filteredHistory.length;
        const paginatedHistory = filteredHistory.slice(offset, offset + limit);
        
        // Prepare result with mock data
        const mockResult = {
          success: true,
          totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
          data: paginatedHistory,
          mock: true
        };
        
        // Cache the mock result
        queryCache[cacheKey] = {
          data: mockResult,
          timestamp: now,
          ttl: 60000 // 60 seconds
        };
        
        res.status(200).json(mockResult);
      } else {
        // Rethrow if it's not the "relation does not exist" error
        throw dbError;
      }
    }
  } catch (error) {
    console.error('Error fetching change history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve change history',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};