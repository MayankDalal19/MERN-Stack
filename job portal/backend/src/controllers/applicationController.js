import Application from '../models/Application.js';
import Job from '../models/Job.js';
import uploadToCloudinary from '../utils/uploadToCloudinary.js';

export async function createApplication(req, res, next) {
  try {
    const { jobId, coverLetter } = req.body;
    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    const job = await Job.findOne({ _id: jobId, status: 'open' });
    if (!job) {
      return res.status(404).json({ message: 'Open job not found' });
    }

    const existingApplication = await Application.findOne({
      job: job._id,
      applicant: req.user._id,
    });
    if (existingApplication) {
      return res.status(409).json({ message: 'You have already applied to this job' });
    }

    let resume;
    if (req.file) {
      const file = await uploadToCloudinary(req.file.buffer, 'job-portal/resumes', 'raw');
      resume = { url: file.secure_url, publicId: file.public_id };
    }

    const application = await Application.create({
      job: job._id,
      applicant: req.user._id,
      coverLetter: coverLetter || '',
      resume,
    });

    res.status(201).json({ application });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'You have already applied to this job' });
    }
    next(error);
  }
}

export async function getMyApplications(req, res, next) {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job')
      .sort({ createdAt: -1 });

    const appliedJobIds = applications
      .map((app) => (app.job ? app.job._id.toString() : null))
      .filter(Boolean);

    const viewedJobIds = (req.user.viewedJobs || []).map((id) => id.toString());

    res.json({
      applications,
      appliedJobIds,
      viewedJobIds,
    });
  } catch (error) {
    next(error);
  }
}

export async function getJobApplications(req, res, next) {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (req.user.role !== 'admin' && !job.recruiter.equals(req.user._id)) {
      return res
        .status(403)
        .json({ message: 'You do not have permission to view applicants for this role' });
    }

    const applications = await Application.find({ job: jobId })
      .populate('applicant', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    next(error);
  }
}

export async function listApplications(req, res, next) {
  try {
    const query =
      req.user.role === 'applicant'
        ? { applicant: req.user._id }
        : req.user.role === 'recruiter'
          ? {}
          : {};

    const applications = await Application.find(query)
      .populate({
        path: 'job',
        match: req.user.role === 'recruiter' ? { recruiter: req.user._id } : {},
      })
      .populate('applicant', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ applications: applications.filter((item) => item.job) });
  } catch (error) {
    next(error);
  }
}

export async function updateApplicationStatus(req, res, next) {
  try {
    const application = await Application.findById(req.params.id).populate('job');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (
      req.user.role !== 'admin' &&
      (!application.job || !application.job.recruiter.equals(req.user._id))
    ) {
      return res.status(403).json({ message: 'Not permitted to update this application' });
    }

    application.status = req.body.status;
    await application.save();
    res.json({ application });
  } catch (error) {
    next(error);
  }
}

