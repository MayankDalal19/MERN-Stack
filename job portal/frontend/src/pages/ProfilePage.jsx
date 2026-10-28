import { useEffect, useState } from 'react';
import { usersApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      if (user.avatar?.url) {
        setPreviewUrl(user.avatar.url);
      }
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setError('');
    if (!file) {
      setImageFile(null);
      return;
    }

    // Client validation: max 2 MB
    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      setError('Profile image must be 2 MB or less.');
      e.target.value = '';
      setImageFile(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Only image files (JPEG, PNG, WEBP, GIF) are allowed for profile picture.');
      e.target.value = '';
      setImageFile(null);
      return;
    }

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim() || !email.trim()) {
      setError('Name and Email are required.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('email', email.trim());
      if (imageFile) {
        formData.append('avatar', imageFile);
      }

      await usersApi.updateProfile(formData);
      await refreshUser();
      setSuccess('Profile updated successfully!');
      setImageFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="profile-page-container">
      <p className="eyebrow">YOUR ACCOUNT</p>
      <h1>Profile</h1>
      <p className="lead" style={{ marginBottom: 28 }}>
        Keep your details current to get the most from CareerNest.
      </p>

      <div className="card profile-card">
        <h2>Personal details</h2>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="profile-avatar-preview">
          {previewUrl ? (
            <img src={previewUrl} alt="Avatar preview" className="profile-avatar-circle" />
          ) : (
            <div className="profile-avatar-circle">{getInitials(name)}</div>
          )}
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>{name || 'Your Name'}</p>
            <p className="muted" style={{ margin: 0, fontSize: 13, textTransform: 'capitalize' }}>
              Role: {user?.role || 'Applicant'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field">
            <label>
              Profile image <span className="hint">optional · max 2 MB</span>
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleImageChange}
            />
          </div>

          <button
            type="submit"
            className="button full"
            disabled={submitting}
            style={{ marginTop: 12 }}
          >
            {submitting ? 'Saving profile...' : 'Save profile'}
          </button>
        </form>
      </div>
    </section>
  );
}
