import User from '../models/User.js';
import uploadToCloudinary, { deleteFromCloudinary } from '../utils/uploadToCloudinary.js';

const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  viewedJobs: user.viewedJobs || [],
});

export async function updateProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email } = req.body;

    if (name) {
      user.name = name.trim();
    }

    if (email && email.toLowerCase().trim() !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase().trim() });
      if (existing) {
        return res.status(409).json({ message: 'That email is already registered' });
      }
      user.email = email.toLowerCase().trim();
    }

    if (req.file) {
      if (user.avatar && user.avatar.publicId) {
        await deleteFromCloudinary(user.avatar.publicId, 'image');
      }

      const uploaded = await uploadToCloudinary(req.file.buffer, 'job-portal/avatars', 'image');
      user.avatar = {
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
      };
    }

    await user.save();

    res.json({ user: safeUser(user) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'That email is already registered' });
    }
    next(error);
  }
}

export async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user: safeUser(user) });
  } catch (error) {
    next(error);
  }
}
