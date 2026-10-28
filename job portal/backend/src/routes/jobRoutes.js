import { Router } from 'express';
import {
  createJob,
  deleteJob,
  getJobById,
  listJobs,
  listMyJobs,
  markJobViewed,
  updateJob,
} from '../controllers/jobController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = Router();

// Public job listings
router.get('/', listJobs);

// Recruiter jobs - must be before /:id so "mine" is not treated as an id
router.get('/mine', protect, authorize('recruiter', 'admin'), listMyJobs);

// Single job details (public)
router.get('/:id', getJobById);

// Recruiter actions
router.post('/', protect, authorize('recruiter', 'admin'), createJob);
router.patch('/:id', protect, authorize('recruiter', 'admin'), updateJob);
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteJob);

// Mark as viewed
router.post('/:id/view', protect, markJobViewed);

export default router;

