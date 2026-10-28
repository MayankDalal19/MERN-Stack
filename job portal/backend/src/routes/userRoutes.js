import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadAvatar } from '../middleware/uploadMiddleware.js';

const router = Router();

router.use(protect);

router.get('/profile', getProfile);
router.patch('/profile', uploadAvatar, updateProfile);

export default router;
