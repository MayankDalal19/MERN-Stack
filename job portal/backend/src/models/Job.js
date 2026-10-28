import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    companyName: { type: String, required: true, trim: true },
    logoUrl: { type: String, trim: true, default: '' },
    aboutCompany: { type: String, default: '' },
    description: { type: String, required: true },
    location: { type: String, required: true },
    employmentType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
      default: 'Full-time',
      required: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'INR' },
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
  },
  { timestamps: true }
);

jobSchema.pre('validate', function (next) {
  if (
    this.salary &&
    this.salary.min != null &&
    this.salary.max != null &&
    Number(this.salary.min) > Number(this.salary.max)
  ) {
    return next(new Error('Minimum salary must be less than or equal to maximum salary'));
  }
  next();
});

export default mongoose.model('Job', jobSchema);

