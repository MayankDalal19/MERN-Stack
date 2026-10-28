import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { applicationsApi, jobsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

function formatTimeAgo(dateString) {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
  if (diffInHours < 1) return 'Just now';
  if (diffInHours === 1) return '1 hour ago';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  return `${diffInDays} days ago`;
}

function getInitials(name) {
  if (!name) return 'JB';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Apply state
  const [isApplying, setIsApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [hasApplied, setHasApplied] = useState(false);

  // Mark job as viewed and load job details
  useEffect(() => {
    // Record view locally immediately
    try {
      const stored = JSON.parse(localStorage.getItem('careernest_viewed_jobs') || '[]');
      if (!stored.includes(id)) {
        stored.push(id);
        localStorage.setItem('careernest_viewed_jobs', JSON.stringify(stored));
      }
    } catch {
      // ignore
    }

    // Call server to mark viewed if logged in
    if (user) {
      jobsApi.markViewed(id).then(() => refreshUser()).catch(() => {});
    }

    // Fetch job details
    jobsApi
      .getById(id)
      .then(({ data }) => {
        setJob(data.job);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load job details');
      })
      .finally(() => setLoading(false));

    // Check if current user already applied
    if (user && user.role === 'applicant') {
      applicationsApi
        .getMine()
        .then(({ data }) => {
          if (data.appliedJobIds?.includes(id)) {
            setHasApplied(true);
          }
        })
        .catch(() => {});
    }
  }, [id, user]);

  const handleApplyClick = () => {
    if (!user) {
      navigate(`/login?redirect=/jobs/${id}`);
      return;
    }
    setIsApplying(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSubmitError('');
    if (!file) {
      setResumeFile(null);
      return;
    }

    // Max 5 MB validation
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setSubmitError('Résumé file size must be 5 MB or less.');
      e.target.value = '';
      setResumeFile(null);
      return;
    }

    // Extension / type validation
    const validExtensions = ['.pdf', '.doc', '.docx'];
    const lowerName = file.name.toLowerCase();
    const isValidExt = validExtensions.some((ext) => lowerName.endsWith(ext));
    if (!isValidExt) {
      setSubmitError('Please choose a valid résumé file (PDF, DOC, or DOCX).');
      e.target.value = '';
      setResumeFile(null);
      return;
    }

    setResumeFile(file);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (!resumeFile) {
      setSubmitError('Please upload your résumé to submit your application.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('jobId', id);
      formData.append('coverLetter', coverLetter);
      formData.append('resume', resumeFile);

      await applicationsApi.create(formData);
      setSubmitSuccess('Your application was submitted successfully!');
      setHasApplied(true);
      setIsApplying(false);
    } catch (err) {
      if (err.response?.status === 409) {
        setSubmitError('You have already applied to this job.');
        setHasApplied(true);
      } else {
        setSubmitError(err.response?.data?.message || 'Failed to submit application. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '48px 0', color: 'var(--text-muted)' }}>Loading job details...</div>;
  }

  if (error || !job) {
    return (
      <div className="card" style={{ maxWidth: 600, margin: '40px auto', textAlign: 'center' }}>
        <h2>Job not found</h2>
        <p className="muted">{error || 'The requested job post could not be found or has been removed.'}</p>
        <Link to="/jobs" className="rust-link" style={{ marginTop: 16 }}>
          ← Back to all jobs
        </Link>
      </div>
    );
  }

  return (
    <section>
      <div className="back-link-bar">
        <Link to="/jobs" className="rust-link">
          ← All jobs
        </Link>
      </div>

      <div className="job-detail-header">
        <div className="logo-tile" style={{ width: 56, height: 56, fontSize: 18 }}>
          {job.logoUrl ? (
            <img src={job.logoUrl} alt={job.companyName} />
          ) : (
            getInitials(job.companyName)
          )}
        </div>

        <div className="job-detail-header-info">
          <p className="job-detail-type-eyebrow">
            {job.employmentType || 'FULL-TIME'}
          </p>
          <h1 className="job-detail-title">{job.title}</h1>
          <p className="job-detail-submeta">
            {job.companyName} · {job.location} · Posted {formatTimeAgo(job.createdAt)}
          </p>
        </div>
      </div>

      <div className="job-detail-layout">
        {/* Left Column: About role & About company */}
        <div className="job-detail-main">
          <div className="job-detail-section">
            <h2>About the role</h2>
            <div className="job-detail-description">{job.description}</div>

            {job.skills && job.skills.length > 0 && (
              <div className="skill-pills-list">
                {job.skills.map((skill, index) => (
                  <span key={index} className="pill">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="job-detail-section">
            <h2>About {job.companyName}</h2>
            <p className="muted" style={{ lineHeight: 1.6 }}>
              {job.aboutCompany && job.aboutCompany.trim()
                ? job.aboutCompany
                : 'Company information will be shared by the recruiter soon.'}
            </p>
          </div>
        </div>

        {/* Right Column: "Make your move" Sage Card */}
        <aside>
          <div className="make-move-card">
            <p className="eyebrow">INTERESTED?</p>
            <h2>Make your move.</h2>
            <p>Apply directly and keep track of your application from your workspace.</p>

            {submitSuccess && (
              <div className="alert alert-success" style={{ marginBottom: 16 }}>
                {submitSuccess}
              </div>
            )}

            {submitError && (
              <div className="alert alert-error" style={{ marginBottom: 16 }}>
                {submitError}
              </div>
            )}

            {user?.role === 'recruiter' || user?.role === 'admin' ? (
              <p className="muted" style={{ fontSize: 13, fontStyle: 'italic' }}>
                You are currently signed in as a {user.role}. Applicants can submit applications for this role.
              </p>
            ) : hasApplied ? (
              <div className="alert alert-info" style={{ margin: 0 }}>
                You have already applied to this position. You can track updates on your{' '}
                <Link to="/dashboard" style={{ color: 'inherit', fontWeight: 600 }}>
                  Dashboard
                </Link>
                .
              </div>
            ) : !isApplying ? (
              <button
                type="button"
                className="button full"
                onClick={handleApplyClick}
              >
                Apply now
              </button>
            ) : (
              <div>
                <button
                  type="button"
                  className="button full"
                  disabled
                  style={{ opacity: 0.9 }}
                >
                  Apply now
                </button>

                <hr className="apply-divider" />

                <form onSubmit={handleSubmitApplication} className="apply-form">
                  <div className="field">
                    <label>Cover letter optional</label>
                    <textarea
                      rows={4}
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Share a short note on why you're a good fit..."
                    />
                  </div>

                  <div className="field">
                    <label>Résumé PDF, DOC, or DOCX · 5 MB max</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileChange}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="button full"
                    disabled={submitting}
                    style={{ marginTop: 8 }}
                  >
                    {submitting ? 'Submitting application...' : 'Submit application'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
