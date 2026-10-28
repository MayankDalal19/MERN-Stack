import multer from 'multer';

const storage = multer.memoryStorage();

const resumeFilter = (req, file, callback) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowedMimes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    const error = new Error('Only PDF, DOC, or DOCX files are allowed for résumé');
    error.statusCode = 400;
    callback(error, false);
  }
};

const avatarFilter = (req, file, callback) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/jpg',
  ];
  if (allowedMimes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    const error = new Error('Only image files (JPEG, PNG, WEBP, GIF) are allowed for profile picture');
    error.statusCode = 400;
    callback(error, false);
  }
};

const resumeMulter = multer({
  storage,
  fileFilter: resumeFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).single('resume');

export const uploadResume = (req, res, next) => {
  resumeMulter(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Résumé file must be 5 MB or less' });
      }
      return res.status(err.statusCode || 400).json({ message: err.message });
    }
    next();
  });
};

const avatarMulter = multer({
  storage,
  fileFilter: avatarFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
}).fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'profileImage', maxCount: 1 },
]);

export const uploadAvatar = (req, res, next) => {
  avatarMulter(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Profile image must be 2 MB or less' });
      }
      return res.status(err.statusCode || 400).json({ message: err.message });
    }
    if (req.files) {
      req.file = req.files.avatar?.[0] || req.files.profileImage?.[0];
    }
    next();
  });
};

