import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsApi } from '../api/client';
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

export default function JobsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    keyword: '',
    location: '',
    employmentType: '',
  });

  const [localViewedJobs, setLocalViewedJobs] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('careernest_viewed_jobs') || '[]');
      setLocalViewedJobs(stored);
    } catch {
      setLocalViewedJobs([]);
    }
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.keyword.trim()) params.keyword = filters.keyword.trim();
      if (filters.location.trim()) params.location = filters.location.trim();
      if (filters.employmentType && filters.employmentType !== 'Any type') {
        params.employmentType = filters.employmentType;
      }
      const { data } = await jobsApi.list(params);
      setJobs(data.jobs || []);
    } catch (err) {
      console.error('Failed to load jobs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const isJobViewed = (jobId) => {
    const fromUser = user?.viewedJobs?.some((id) =>
      typeof id === 'string' ? id === jobId : id?._id === jobId
    );
    const fromStorage = localViewedJobs.includes(jobId);
    return fromUser || fromStorage;
  };

  const handleCardClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  return (
    <section>
      <div className="jobs-page-header">
        <p className="eyebrow">OPEN ROLES</p>
        <h1>Find your next opportunity</h1>
      </div>

      <form
        className="search-bar-sage"
        onSubmit={(e) => {
          e.preventDefault();
          loadJobs();
        }}
      >
        <input
          type="text"
          placeholder="Title, skill, or company"
          value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
        />
        <input
          type="text"
          placeholder="Location"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
        />
        <select
          value={filters.employmentType}
          onChange={(e) => setFilters({ ...filters, employmentType: e.target.value })}
        >
          <option value="">Any type</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Internship">Internship</option>
        </select>
        <button type="submit" className="button">
          Search
        </button>
      </form>

      {loading ? (
        <div style={{ padding: '36px 0', color: 'var(--text-muted)' }}>
          Loading opportunities...
        </div>
      ) : (
        <div className="job-cards-list">
          {jobs.map((job) => {
            const viewed = isJobViewed(job._id);
            return (
              <div
                key={job._id}
                className="job-card-item"
                onClick={() => handleCardClick(job._id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleCardClick(job._id);
                  }
                }}
              >
                <div className="logo-tile">
                  {job.logoUrl ? (
                    <img src={job.logoUrl} alt={job.companyName} />
                  ) : (
                    getInitials(job.companyName)
                  )}
                </div>

                <div className="job-card-info">
                  <div className="job-card-top">
                    <h3 className="job-card-title">{job.title}</h3>
                    {viewed && <span className="viewed-badge">Viewed</span>}
                  </div>
                  <p className="job-card-company">
                    {job.companyName} · {job.location}
                  </p>
                  <p className="job-card-meta">
                    {formatTimeAgo(job.createdAt)} · {job.employmentType}
                  </p>
                </div>
              </div>
            );
          })}

          {!jobs.length && (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <p className="muted" style={{ margin: 0 }}>
                No open roles match your search filters right now. Try adjusting your search criteria.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
