import { Router } from 'express';
import { createJob, deleteJob, listJobs, updateJob } from '../controllers/jobController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
const router = Router(); router.get('/', listJobs); router.post('/', protect, authorize('recruiter', 'admin'), createJob); router.patch('/:id', protect, authorize('recruiter', 'admin'), updateJob); router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteJob); export default router;
