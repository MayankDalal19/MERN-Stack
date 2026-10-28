import Job from '../models/Job.js';
import User from '../models/User.js';

function parseSkills(skills) {
  if (Array.isArray(skills)) {
    return skills.map((s) => String(s).trim()).filter(Boolean);
  }
  if (typeof skills === 'string') {
    return skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export async function listJobs(req, res, next) {
  try {
    const { keyword, location, employmentType } = req.query;
    const query = { status: 'open' };

    if (keyword) {
      query.$or = ['title', 'companyName', 'description', 'skills'].map((field) => ({
        [field]: { $regex: keyword, $options: 'i' },
      }));
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    if (employmentType && employmentType !== 'Any type') {
      query.employmentType = employmentType;
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 }).populate('recruiter', 'name email');
    res.json({ jobs });
  } catch (error) {
    next(error);
  }
}

export async function getJobById(req, res, next) {
  try {
    const job = await Job.findById(req.params.id).populate('recruiter', 'name email');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json({ job });
  } catch (error) {
    next(error);
  }
}

export async function listMyJobs(req, res, next) {
  try {
    const query = req.user.role === 'admin' ? {} : { recruiter: req.user._id };
    const jobs = await Job.find(query).sort({ createdAt: -1 }).populate('recruiter', 'name email');
    res.json({ jobs });
  } catch (error) {
    next(error);
  }
}

export async function createJob(req, res, next) {
  try {
    const {
      title,
      companyName,
      logoUrl,
      aboutCompany,
      description,
      location,
      employmentType = 'Full-time',
      skills,
      salary,
    } = req.body;

    if (!title || !companyName || !description || !location) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const parsedSalary = salary
      ? {
          min: salary.min !== undefined && salary.min !== '' ? Number(salary.min) : undefined,
          max: salary.max !== undefined && salary.max !== '' ? Number(salary.max) : undefined,
          currency: salary.currency || 'INR',
        }
      : undefined;

    if (
      parsedSalary &&
      parsedSalary.min != null &&
      parsedSalary.max != null &&
      parsedSalary.min > parsedSalary.max
    ) {
      return res
        .status(400)
        .json({ message: 'Minimum salary must be less than or equal to maximum salary' });
    }

    const formattedSkills = parseSkills(skills);

    const job = await Job.create({
      title,
      companyName,
      logoUrl: logoUrl || '',
      aboutCompany: aboutCompany || '',
      description,
      location,
      employmentType,
      skills: formattedSkills,
      salary: parsedSalary,
      recruiter: req.user._id,
    });

    res.status(201).json({ job });
  } catch (error) {
    next(error);
  }
}

export async function updateJob(req, res, next) {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (req.user.role !== 'admin' && !job.recruiter.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not your job post' });
    }

    const updates = { ...req.body };

    if (updates.skills !== undefined) {
      updates.skills = parseSkills(updates.skills);
    }

    if (updates.salary !== undefined) {
      const min =
        updates.salary.min !== undefined && updates.salary.min !== ''
          ? Number(updates.salary.min)
          : job.salary?.min;
      const max =
        updates.salary.max !== undefined && updates.salary.max !== ''
          ? Number(updates.salary.max)
          : job.salary?.max;

      if (min != null && max != null && min > max) {
        return res
          .status(400)
          .json({ message: 'Minimum salary must be less than or equal to maximum salary' });
      }

      updates.salary = {
        min,
        max,
        currency: updates.salary.currency || job.salary?.currency || 'INR',
      };
    }

    Object.assign(job, updates);
    await job.save();
    res.json({ job });
  } catch (error) {
    next(error);
  }
}

export async function deleteJob(req, res, next) {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (req.user.role !== 'admin' && !job.recruiter.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not your job post' });
    }

    await job.deleteOne();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function markJobViewed(req, res, next) {
  try {
    const { id } = req.params;
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { viewedJobs: id },
      });
      const updatedUser = await User.findById(req.user._id);
      return res.json({ success: true, viewedJobs: updatedUser.viewedJobs });
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

