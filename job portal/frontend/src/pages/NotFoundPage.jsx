import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section style={{ maxWidth: 540, margin: '60px auto', textAlign: 'center' }}>
      <p className="eyebrow">404 NOT FOUND</p>
      <h1>Page not found</h1>
      <p className="lead" style={{ margin: '0 auto 28px' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="button">
        Back to home
      </Link>
    </section>
  );
}
