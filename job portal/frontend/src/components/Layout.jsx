import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <>
      <header>
        <Link className="brand" to="/">
          CareerNest
        </Link>
        <nav>
          <NavLink to="/jobs">Find jobs</NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              {(user.role === 'recruiter' || user.role === 'admin') && (
                <NavLink to="/recruiter/jobs">Post a role</NavLink>
              )}
              <NavLink to="/profile" className="nav-user">
                {user.avatar?.url ? (
                  <img src={user.avatar.url} alt={user.name} className="nav-avatar" />
                ) : (
                  <span className="nav-avatar">{getInitials(user.name)}</span>
                )}
                <span>Profile</span>
              </NavLink>
              <button className="link-button" onClick={handleLogout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Sign in</NavLink>
              <Link className="button small" to="/register">
                Get started
              </Link>
            </>
          )}
        </nav>
      </header>
      <main>{children}</main>
    </>
  );
}
