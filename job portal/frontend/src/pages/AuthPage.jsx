import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function AuthPage({ mode }) {
  const isLogin = mode === 'login';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const { login } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'applicant',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login({ email: form.email, password: form.password });
      } else {
        await client.post('/auth/register', form);
        await login({ email: form.email, password: form.password });
      }
      navigate(redirectUrl);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-wrapper">
      <p className="eyebrow">Welcome to CareerNest</p>
      <h1>{isLogin ? 'Good to see you again.' : 'Start your next chapter.'}</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={submit}>
        {!isLogin && (
          <>
            <div className="field">
              <label>Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="field">
              <label>Joining as</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="applicant">Applicant</option>
                <option value="recruiter">Recruiter</option>
              </select>
            </div>
          </>
        )}

        <div className="field">
          <label>Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="field">
          <label>Password</label>
          <input
            type="password"
            minLength={8}
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <button
          className="button full"
          type="submit"
          disabled={loading}
          style={{ marginTop: 8 }}
        >
          {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
        </button>
      </form>

      <p className="muted" style={{ marginTop: 24, textAlign: 'center', fontSize: 14 }}>
        {isLogin ? 'New here?' : 'Already have an account?'}{' '}
        <Link
          to={
            isLogin
              ? `/register${redirectUrl !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`
              : `/login${redirectUrl !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`
          }
          className="rust-link"
        >
          {isLogin ? 'Create an account' : 'Sign in'}
        </Link>
      </p>
    </section>
  );
}
