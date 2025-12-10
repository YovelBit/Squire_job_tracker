import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AppLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <div className="header">
        <div>
          <h1>Job Dashboard</h1>
          <p className="muted">Track, filter, and update your job search</p>
        </div>
        <button className="btn secondary" onClick={handleLogout}>
          Log out
        </button>
      </div>
      <Outlet />
    </div>
  );
};

export default AppLayout;
