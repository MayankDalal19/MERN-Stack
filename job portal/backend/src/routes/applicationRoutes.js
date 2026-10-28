import { Router } from 'express';
import {
  createApplication,
  getJobApplications,
  getMyApplications,
  listApplications,
  updateApplicationStatus,
} from '../controllers/applicationController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { uploadResume } from '../middleware/uploadMiddleware.js';

const router = Router();

router.use(protect);

// Applicant endpoints
router.get('/me', authorize('applicant', 'admin'), getMyApplications);
router.post('/', authorize('applicant'), uploadResume, createApplication);

// Recruiter endpoints
router.get('/job/:jobId', authorize('recruiter', 'admin'), getJobApplications);
router.patch('/:id/status', authorize('recruiter', 'admin'), updateApplicationStatus);

// All / filtered applications list
router.get('/', listApplications);

export default router;

