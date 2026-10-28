import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { applicationsApi, jobsApi } from '../api/client';
import JobForm from '../components/JobForm';

export default function RecruiterJobsPage() {
  const { id: editJobId } = useParams();
  const navigate = useNavigate();

  const [myJobs, setMyJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Submissions state
  const [selectedJobForSubmissions, setSelectedJobForSubmissions] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const fetchMyJobs = async () => {
    try {
      setLoadingJobs(true);
      const { data } = await jobsApi.getMine();
      setMyJobs(data.jobs || []);
    } catch (err) {
      console.error('Failed to load recruiter jobs', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const handleSubmissionsClick = async (job) => {
    if (selectedJobForSubmissions?._id === job._id) {
      // Toggle off if already opened
      setSelectedJobForSubmissions(null);
      setSubmissions([]);
      return;
    }

    try {
      setSelectedJobForSubmissions(job);
      setLoadingSubmissions(true);
      setSubmissionError('');
      const { data } = await applicationsApi.getByJob(job._id);
      setSubmissions(data.applications || []);
    } catch (err) {
      setSubmissionError(err.response?.data?.message || 'Failed to load applicants');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      setStatusUpdatingId(applicationId);
      const { data } = await applicationsApi.updateStatus(applicationId, newStatus);
      setSubmissions((prev) =>
        prev.map((app) => (app._id === applicationId ? data.application : app))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update application status');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleJobSaved = () => {
    fetchMyJobs();
    if (editJobId) {
      navigate('/recruiter/jobs');
    }
  };

  return (
    <section>
      <div className="recruiter-layout">
        {/* Left Card: Form */}
        <div>
          <JobForm editJobId={editJobId} onJobSaved={handleJobSaved} />
        </div>

        {/* Right Card: Job Submissions */}
        <div>
          <div className="submissions-card">
            <p className="eyebrow">APPLICATIONS</p>
            <h2>Job submissions</h2>
            <p className="muted" style={{ margin: '0 0 16px 0' }}>
              Choose a role to see its applicants.
            </p>

            {loadingJobs ? (
              <div style={{ color: 'var(--text-muted)', padding: '16px 0' }}>
                Loading your job listings...
              </div>
            ) : (
              <div className="submissions-job-list">
                {myJobs.map((job) => {
                  const isCurrentEditing = editJobId === job._id;
                  const isViewingSubmissions = selectedJobForSubmissions?._id === job._id;

                  return (
                    <div
                      key={job._id}
                      className={`submissions-job-row ${isCurrentEditing ? 'active-edit' : ''}`}
                    >
                      <div className="submissions-job-info">
                        <h4 className="submissions-job-title">{job.title}</h4>
                        <p className="submissions-job-meta">
                          {job.companyName} · {job.location}
                        </p>
                      </div>

                      <div className="submissions-actions">
                        <Link
                          to={`/recruiter/jobs/${job._id}/edit`}
                          className={`edit-link-btn ${isCurrentEditing ? 'focused' : ''}`}
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="rust-link"
                          style={{
                            fontWeight: isViewingSubmissions ? 700 : 500,
                            textDecoration: isViewingSubmissions ? 'underline' : 'none',
                          }}
                          onClick={() => handleSubmissionsClick(job)}
                        >
                          Submissions
                        </button>
                      </div>
                    </div>
                  );
                })}

                {!myJobs.length && (
                  <p className="muted" style={{ padding: '12px 0' }}>
                    You haven&apos;t posted any roles yet. Use the form on the left to publish your first role.
                  </p>
                )}
              </div>
            )}

            {/* Submissions Viewer */}
            {selectedJobForSubmissions && (
              <div className="applicant-submissions-viewer">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 16,
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 17 }}>
                    Applicants: {selectedJobForSubmissions.title}
                  </h3>
                  <button
                    type="button"
                    className="link-button"
                    style={{ fontSize: 13 }}
                    onClick={() => setSelectedJobForSubmissions(null)}
                  >
                    Close ✕
                  </button>
                </div>

                {submissionError && <div className="alert alert-error">{submissionError}</div>}

                {loadingSubmissions ? (
                  <div style={{ color: 'var(--text-muted)', padding: '12px 0' }}>
                    Loading applicants...
                  </div>
                ) : (
                  <div>
                    {submissions.map((app) => (
                      <div key={app._id} className="applicant-card">
                        <div className="applicant-header">
                          <div>
                            <p className="applicant-name">{app.applicant?.name || 'Applicant'}</p>
                            <p className="applicant-email">{app.applicant?.email}</p>
                          </div>
                          <span className={`status-badge status-${app.status}`}>
                            {app.status}
                          </span>
                        </div>

                        {app.coverLetter && (
                          <div className="applicant-cover-letter">
                            <strong>Cover letter:</strong> {app.coverLetter}
                          </div>
                        )}

                        <div className="applicant-footer">
                          {app.resume?.url ? (
                            <a
                              href={app.resume.url}
                              target="_blank"
                              rel="noreferrer"
                              className="rust-link"
                              style={{ fontSize: 13 }}
                            >
                              📄 View résumé
                            </a>
                          ) : (
                            <span className="muted" style={{ fontSize: 12 }}>
                              No résumé uploaded
                            </span>
                          )}

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <label
                              htmlFor={`status-${app._id}`}
                              style={{ fontSize: 12, margin: 0, fontWeight: 500 }}
                            >
                              Status:
                            </label>
                            <select
                              id={`status-${app._id}`}
                              value={app.status}
                              disabled={statusUpdatingId === app._id}
                              onChange={(e) => handleStatusChange(app._id, e.target.value)}
                              style={{
                                padding: '4px 8px',
                                fontSize: 13,
                                width: 'auto',
                                height: 32,
                              }}
                            >
                              <option value="submitted">Submitted</option>
                              <option value="reviewing">Reviewing</option>
                              <option value="shortlisted">Shortlisted</option>
                              <option value="rejected">Rejected</option>
                              <option value="hired">Hired</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}

                    {!submissions.length && (
                      <p className="muted" style={{ fontStyle: 'italic', margin: '12px 0' }}>
                        No applicants have submitted applications for this role yet.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
