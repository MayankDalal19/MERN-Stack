import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jobsApi } from '../api/client';

export default function JobForm({ editJobId, onJobSaved }) {
  const navigate = useNavigate();
  const isEdit = Boolean(editJobId);

  const [form, setForm] = useState({
    title: '',
    companyName: '',
    logoUrl: '',
    aboutCompany: '',
    location: '',
    employmentType: 'Full-time',
    skills: '',
    salaryMin: '',
    salaryMax: '',
    description: '',
  });

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (editJobId) {
      setLoading(true);
      setError('');
      jobsApi
        .getById(editJobId)
        .then(({ data }) => {
          const j = data.job;
          setForm({
            title: j.title || '',
            companyName: j.companyName || '',
            logoUrl: j.logoUrl || '',
            aboutCompany: j.aboutCompany || '',
            location: j.location || '',
            employmentType: j.employmentType || 'Full-time',
            skills: Array.isArray(j.skills) ? j.skills.join(', ') : j.skills || '',
            salaryMin: j.salary?.min != null ? j.salary.min : '',
            salaryMax: j.salary?.max != null ? j.salary.max : '',
            description: j.description || '',
          });
        })
        .catch((err) => {
          setError(err.response?.data?.message || 'Failed to load job post details');
        })
        .finally(() => setLoading(false));
    } else {
      setForm({
        title: '',
        companyName: '',
        logoUrl: '',
        aboutCompany: '',
        location: '',
        employmentType: 'Full-time',
        skills: '',
        salaryMin: '',
        salaryMax: '',
        description: '',
      });
      setError('');
      setSuccess('');
    }
  }, [editJobId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client validation: min salary <= max salary
    if (form.salaryMin !== '' && form.salaryMax !== '') {
      if (Number(form.salaryMin) > Number(form.salaryMax)) {
        setError('Minimum salary must be less than or equal to maximum salary');
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        title: form.title,
        companyName: form.companyName,
        logoUrl: form.logoUrl,
        aboutCompany: form.aboutCompany,
        location: form.location,
        employmentType: form.employmentType,
        skills: form.skills,
        description: form.description,
        salary: {
          min: form.salaryMin !== '' ? Number(form.salaryMin) : undefined,
          max: form.salaryMax !== '' ? Number(form.salaryMax) : undefined,
        },
      };

      if (isEdit) {
        const { data } = await jobsApi.update(editJobId, payload);
        setSuccess('Job post updated successfully!');
        if (onJobSaved) onJobSaved(data.job);
      } else {
        const { data } = await jobsApi.create(payload);
        setSuccess('Job post published successfully!');
        setForm({
          title: '',
          companyName: '',
          logoUrl: '',
          aboutCompany: '',
          location: '',
          employmentType: 'Full-time',
          skills: '',
          salaryMin: '',
          salaryMax: '',
          description: '',
        });
        if (onJobSaved) onJobSaved(data.job);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save job post');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '24px 0', color: 'var(--text-muted)' }}>Loading job details...</div>;
  }

  return (
    <div className="recruiter-form-card">
      <div className="form-header-row">
        <div>
          <p className="eyebrow">JOB MANAGEMENT</p>
          <h2>{isEdit ? 'Edit job post' : 'Post a new role'}</h2>
        </div>
        {isEdit && (
          <Link to="/recruiter/jobs" className="rust-link">
            Cancel edit
          </Link>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* Row 1: Job title & Company name */}
        <div className="form-row">
          <div className="field">
            <label>Job title</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Company name</label>
            <input
              type="text"
              required
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            />
          </div>
        </div>

        {/* Row 2: Company logo URL optional */}
        <div className="field">
          <label>
            Company logo URL <span className="hint">optional</span>
          </label>
          <input
            type="url"
            value={form.logoUrl}
            onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
          />
        </div>

        {/* Row 3: About the company shown on job detail page */}
        <div className="field">
          <label>
            About the company <span className="hint">shown on job detail page</span>
          </label>
          <textarea
            rows={3}
            value={form.aboutCompany}
            onChange={(e) => setForm({ ...form, aboutCompany: e.target.value })}
          />
        </div>

        {/* Row 4: Location & Employment type */}
        <div className="form-row">
          <div className="field">
            <label>Location</label>
            <input
              type="text"
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Employment type</label>
            <select
              value={form.employmentType}
              onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
        </div>

        {/* Row 5: Skills comma-separated */}
        <div className="field">
          <label>
            Skills <span className="hint">comma-separated</span>
          </label>
          <input
            type="text"
            value={form.skills}
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
          />
        </div>

        {/* Row 6: Minimum salary & Maximum salary */}
        <div className="form-row">
          <div className="field">
            <label>Minimum salary</label>
            <input
              type="number"
              value={form.salaryMin}
              onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Maximum salary</label>
            <input
              type="number"
              value={form.salaryMax}
              onChange={(e) => setForm({ ...form, salaryMax: e.target.value })}
            />
          </div>
        </div>

        {/* Row 7: Role description */}
        <div className="field">
          <label>Role description</label>
          <textarea
            rows={5}
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="button full"
          disabled={submitting}
          style={{ marginTop: 8 }}
        >
          {submitting
            ? isEdit
              ? 'Saving changes...'
              : 'Publishing job...'
            : isEdit
              ? 'Save changes'
              : 'Publish job'}
        </button>
      </form>
    </div>
  );
}
