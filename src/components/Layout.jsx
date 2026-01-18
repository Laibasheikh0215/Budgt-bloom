import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app">
      <nav style={styles.navbar}>
        <div className="container">
          <div style={styles.navContent}>
            <Link to="/" style={styles.logo}>
              <span style={styles.logoText}>💰 Budget Planner</span>
            </Link>
            
            <div style={styles.navLinks}>
              {user ? (
                <>
                  <Link to="/" style={styles.navLink}>Dashboard</Link>
                  <Link to="/income" style={styles.navLink}>Income</Link>
                  <Link to="/expenses" style={styles.navLink}>Expenses</Link>
                  <Link to="/budgets" style={styles.navLink}>Budgets</Link>
                  <button 
                    onClick={handleLogout} 
                    style={styles.logoutButton}
                  >
                    Logout
                  </button>
                  <span style={styles.userEmail}>{user.email}</span>
                </>
              ) : (
                <>
                  <Link to="/login" style={styles.navLink}>Login</Link>
                  <Link to="/register" style={styles.navLink}>Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <main style={styles.main}>
        <div className="container">
          {children}
        </div>
      </main>
      
      <footer style={styles.footer}>
        <div className="container">
          <p style={styles.footerText}>© 2024 Budget Planner - Real User Data Storage</p>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  navbar: {
    backgroundColor: '#212121',
    padding: '15px 0',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  navContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    textDecoration: 'none',
  },
  logoText: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  navLink: {
    color: '#F5F5F5',
    textDecoration: 'none',
    fontSize: '16px',
    transition: 'color 0.3s',
  },
  logoutButton: {
    backgroundColor: '#FF5722',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  userEmail: {
    color: '#BDBDBD',
    fontSize: '14px',
  },
  main: {
    minHeight: 'calc(100vh - 120px)',
    padding: '30px 0',
  },
  footer: {
    backgroundColor: '#212121',
    color: '#F5F5F5',
    padding: '20px 0',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '14px',
    opacity: 0.8,
  },
};

export default Layout;