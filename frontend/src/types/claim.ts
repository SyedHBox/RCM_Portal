export interface Patient {
  id: string;
  name: string;
  dob: string;
  gender: string;
  contact: string;
  address: string;
  insurance: Insurance;
}

export interface Insurance {
  provider: string;
  policyNumber: string;
  groupNumber: string;
  effectiveDate: string;
  expirationDate: string;
}

export interface VisitClaim {
  id: number;
  patient_id: number;
  patient_emr_no?: string;
  cpt_id: string;
  cpt_code: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  service_start?: string;
  service_end: string;
  claim_status: string;
  claim_status_type?: string;
  icd_code?: string;
  provider_name?: string;
  units?: number;
  
  // Claim & Billing Information
  oa_claim_id?: string;
  oa_visit_id?: string;
  charge_dt?: string;
  charge_amt?: number;
  allowed_amt?: number;
  allowed_add_amt?: number;
  allowed_exp_amt?: number;
  total_amt?: number;
  charges_adj_amt?: number;
  write_off_amt?: number;
  bal_amt?: number;
  reimb_pct?: number;
  
  // Primary Insurance
  prim_ins?: string;
  prim_amt?: number;
  prim_post_dt?: string;
  prim_chk_det?: string;
  prim_recv_dt?: string;
  prim_chk_amt?: number;
  prim_cmt?: string;
  
  // Secondary Insurance
  sec_ins?: string;
  sec_amt?: number;
  sec_post_dt?: string;
  sec_chk_det?: string;
  sec_recv_dt?: string;
  sec_chk_amt?: number;
  sec_cmt?: string;
  sec_denial_code?: string; // Added secondary denial code
  
  // Patient Payment
  pat_amt?: number;
  pat_recv_dt?: string;
  
  // Legacy fields - can be removed or kept for backward compatibility
  visitId?: string;
  patientId?: string;
  patientName?: string;
  dob?: string;
  dos?: string;
  checkNumber?: string;
  amount?: number;
  status?: 'Posted' | 'Pending' | 'Rejected';
  createdAt?: string;
  updatedAt?: string;
  notes?: string[];
}

export interface KPIData {
  totalCheckNumbers: number;
  totalVisitIds: number;
  postedVisitIds: number;
  pendingPosting: number;
}

export interface SearchFilters {
  patientId?: string;
  cptId?: string;
  dos?: string;
}

export interface ChangeLog {
  id: number;
  claim_id: number;
  user_id: number;
  username: string;
  cpt_id: number | null;
  timestamp: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  action_type: 'created' | 'updated' | 'deleted';
  // Additional fields from join
  cpt_code?: string;
  first_name?: string;
  last_name?: string;
}

export interface HistoryFilters {
  user_id?: number;
  user_name?: string;
  username?: string;
  cpt_id?: number;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedHistoryResponse {
  success: boolean;
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  data: ChangeLog[];
}
