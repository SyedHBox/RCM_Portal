import express from 'express';
import { 
  getClaims, 
  getClaimById, 
  updateClaim, 
  getClaimHistory,
  getAllChangeHistory 
} from '../controllers/claimController';

const router = express.Router();

// GET all claims with optional filtering
router.get('/', getClaims);

// GET claim by ID
router.get('/:id', getClaimById);

// PUT update claim
router.put('/:id', updateClaim);

// GET claim history by ID
router.get('/:id/history', getClaimHistory);

// GET all change history (with optional filters)
router.get('/history/all', getAllChangeHistory);

// POST new claim
router.post('/', (req, res) => {
  try {
    const newClaim = req.body;
    
    // This will be replaced with actual database insert later
    res.status(201).json({
      status: 'success',
      message: 'Claim created successfully',
      data: { claim: newClaim }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to create claim',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// DELETE claim
router.delete('/:id', (req, res) => {
  try {
    const id = req.params.id;
    
    // This will be replaced with actual database delete later
    res.status(200).json({
      status: 'success',
      message: `Claim with id ${id} deleted successfully`
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete claim',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;