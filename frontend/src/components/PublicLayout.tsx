import { Link, Outlet } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <div className="layout">
      <div style={{ maxWidth: 520, margin: '0 auto' }} className="card">
        <div className="header">
          <div>
            <h1>Squire Job Tracker</h1>
            <p className="muted">Stay on top of your applications</p>
          </div>
          <Link to="/login" className="muted">
            Back to login
          </Link>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default PublicLayout;
