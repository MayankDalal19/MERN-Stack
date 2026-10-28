import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

export default function DashboardPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const firstName = user?.name ? user.name.split(' ')[0] : 'there';
  const isApplicant = user?.role === 'applicant';
  const isRecruiter = user?.role === 'recruiter' || user?.role === 'admin';

  useEffect(() => {
    if (isApplicant) {
      applicationsApi
        .getMine()
        .then(({ data }) => {
          setApplications(data.applications || []);
        })
        .catch((err) => console.error('Failed to load applications', err))
        .finally(() => setLoading(false));
    } else if (isRecruiter) {
      jobsApi
        .getMine()
        .then(({ data }) => {
          setMyJobs(data.jobs || []);
        })
        .catch((err) => console.error('Failed to load my jobs', err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isApplicant, isRecruiter]);

  const message = isApplicant
    ? 'Track applications and keep your profile ready for the next great role.'
    : isRecruiter
      ? 'Manage openings and meet the people behind the applications.'
      : 'Oversee portal activity and manage access across your organization.';

  return (
    <section className="dashboard">
      <p className="eyebrow">{user?.role || 'user'} workspace</p>
      <h1>Welcome back, {firstName}.</h1>
      <p className="lead">{message}</p>

      <div className="dashboard-grid">
        {/* Card 1: Applications (applicant) or Job posts (recruiter) */}
        {isApplicant ? (
          <article className="dashboard-card">
            <h2>My applications</h2>
            <p className="muted">
              Live status updates on roles you have applied for.
            </p>

            {loading ? (
              <p className="muted">Loading applications...</p>
            ) : applications.length > 0 ? (
              <div className="dashboard-applications-list">
                {applications.map((app) => (
                  <div key={app._id} className="dashboard-app-item">
                    <div>
                      <h4 style={{ margin: '0 0 3px 0', fontSize: 15 }}>
                        {app.job ? (
                          <Link
                            to={`/jobs/${app.job._id}`}
                            style={{ color: 'inherit', textDecoration: 'none' }}
                          >
                            {app.job.title}
                          </Link>
                        ) : (
                          'Role Closed'
                        )}
                      </h4>
                      <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                        {app.job?.companyName || 'Unknown company'} · Applied {formatTimeAgo(app.createdAt)}
                      </p>
                    </div>

                    <span className={`status-badge status-${app.status}`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ marginTop: 16 }}>
                <p className="muted">You haven&apos;t applied to any roles yet.</p>
                <Link to="/jobs" className="button small" style={{ marginTop: 8 }}>
                  Explore open roles
                </Link>
              </div>
            )}
          </article>
        ) : (
          <article className="dashboard-card">
            <h2>Your job posts</h2>
            <p className="muted">
              Manage your active listings and review candidate submissions.
            </p>

            {loading ? (
              <p className="muted">Loading job posts...</p>
            ) : (
              <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-primary)' }}>
                  {myJobs.length} active {myJobs.length === 1 ? 'opening' : 'openings'}
                </p>
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <Link to="/recruiter/jobs" className="button small">
                    Post a new role
                  </Link>
                  <Link to="/recruiter/jobs" className="button small secondary">
                    View submissions
                  </Link>
                </div>
              </div>
            )}
          </article>
        )}

        {/* Card 2: Profile */}
        <article className="dashboard-card">
          <h2>Profile</h2>
          <p className="muted">
            Keep your details current to get the most from CareerNest.
          </p>

          <div style={{ marginTop: 'auto', paddingTop: 20 }}>
            <Link to="/profile" className="button small secondary">
              Edit profile →
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
