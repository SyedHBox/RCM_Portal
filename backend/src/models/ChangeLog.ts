/**
 * ChangeLog model for tracking changes to claims
 */
interface ChangeLog {
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
}

export default ChangeLog;