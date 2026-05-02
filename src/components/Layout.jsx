import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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

    // Check screen size
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Handle footer logo error
  const handleFooterLogoError = (e) => {
    e.target.style.display = 'none';
    const parent = e.target.parentElement;
    if (parent) {
      const span = document.createElement('span');
      span.style.cssText = styles.footerLogoIcon.cssText;
      span.textContent = '💰';
      parent.appendChild(span);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingOverlay}>
        <div style={styles.loader}>
          <div style={styles.loaderCircle}></div>
          <p style={styles.loaderText}>Loading...</p>
        </div>
      </div>
    );
  }

  // Logo Component
  const Logo = () => (
    <Link to="/" style={styles.logoLink} onClick={() => setIsMenuOpen(false)}>
      <div style={styles.logoContainer}>
        {logoError ? (
          // Fallback text logo if image fails
          <div style={styles.textLogo}>
            <span style={styles.logoText}>
              <span style={styles.logoPrimary}>Budget</span>
              <span style={styles.logoSecondary}>Planner</span>
            </span>
          </div>
        ) : (
          // Image logo
          <div style={styles.imageLogoContainer}>
            <img 
              src="/assets/logos/logo_planner 1.png" 
              alt="Budget Planner" 
              style={styles.logoImage}
              onError={() => setLogoError(true)}
            />
            <img 
              src="/assets/logos/logo_planner 2.png" 
              alt="Budget Planner" 
              style={styles.logoImage}
              onError={() => setLogoError(true)}
            />
          </div>
        )}
      </div>
    </Link>
  );

  return (
    <div className="app" style={styles.app}>
      {/* Modern Navbar */}
      <nav style={styles.navbar}>
        <div className="container">
          <div style={styles.navContent}>
            {/* Logo */}
            <Logo />

            {/* Mobile Menu Toggle - Only show on mobile */}
            {isMobile && (
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                style={styles.menuToggle}
                aria-label="Toggle menu"
              >
                <span style={isMenuOpen ? styles.menuIconOpen : styles.menuIcon}></span>
              </button>
            )}

            {/* Navigation Links - Show conditionally based on screen size */}
            <div style={{
              ...styles.navLinks,
              ...(isMobile && isMenuOpen ? styles.navLinksOpen : {}),
              ...(isMobile && !isMenuOpen ? styles.navLinksHidden : {}),
              ...(!isMobile ? styles.navLinksDesktop : {})
            }}>
              {user ? (
                <>
                  <NavItem 
                    to="/" 
                    label="Dashboard" 
                    isActive={isActive('/')}
                    onClick={() => {
                      if (isMobile) setIsMenuOpen(false);
                    }}
                  />
                  <NavItem 
                    to="/income" 
                    label="Income" 
                    isActive={isActive('/income')}
                    onClick={() => {
                      if (isMobile) setIsMenuOpen(false);
                    }}
                  />
                  <NavItem 
                    to="/expenses" 
                    label="Expenses" 
                    isActive={isActive('/expenses')}
                    onClick={() => {
                      if (isMobile) setIsMenuOpen(false);
                    }}
                  />
                  <NavItem 
                    to="/budgets" 
                    label="Budgets"
                    isActive={isActive('/budgets')}
                    onClick={() => {
                      if (isMobile) setIsMenuOpen(false);
                    }}
                  />
                  
                  {/* User Profile Dropdown */}
                  <div style={styles.userSection}>
                    <div style={styles.userInfo}>
                      <div style={styles.userAvatar}>
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                      <div style={styles.userDetails}>
                        <p style={styles.userName}>
                          {user.user_metadata?.full_name || 'User'}
                        </p>
                        <p style={styles.userEmail}>
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={handleLogout}
                      style={styles.logoutButton}
                      title="Logout"
                    >
                      <span style={styles.logoutText}>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <NavItem 
                    to="/login" 
                    label="Login" 
                    isActive={isActive('/login')}
                    onClick={() => {
                      if (isMobile) setIsMenuOpen(false);
                    }}
                  />
                  <NavItem 
                    to="/register" 
                    label="Register" 
                    isActive={isActive('/register')}
                    onClick={() => {
                      if (isMobile) setIsMenuOpen(false);
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main style={styles.main}>
        <div className="container">
          {children}
        </div>
      </main>
      
      {/* Modern Footer */}
      <footer style={styles.footer}>
        <div className="container">
          <div style={styles.footerContent}>
            <div style={styles.footerLogo}>
              {logoError ? (
                <span style={styles.footerLogoIcon}>💰</span>
              ) : (
                <img 
                  src="/assets/logos/logo.png" 
                  alt="Budget Planner" 
                  style={styles.footerLogoImage}
                  onError={handleFooterLogoError}
                />
              )}
              <span style={styles.footerLogoText}>Budget Planner</span>
            </div>
            <p style={styles.footerText}>
              © {new Date().getFullYear()} Budget Planner - Track your finances smartly
            </p>
            <div style={styles.footerLinks}>
              <span style={styles.footerLink}>Privacy Policy</span>
              <span style={styles.footerDivider}>•</span>
              <span style={styles.footerLink}>Terms of Service</span>
              <span style={styles.footerDivider}>•</span>
              <span style={styles.footerLink}>Contact</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Navigation Item Component
const NavItem = ({ to, label, icon, isActive, onClick }) => (
  <Link 
    to={to} 
    style={{
      ...styles.navItem,
      ...(isActive ? styles.navItemActive : {})
    }}
    onClick={onClick}
  >
    <span style={styles.navIcon}>{icon}</span>
    <span style={styles.navLabel}>{label}</span>
    {isActive && <span style={styles.navActiveIndicator}></span>}
  </Link>
);

const styles = {
  
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f8fafc',
  },
  loadingOverlay: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f8fafc',
  },
  loader: {
    textAlign: 'center',
  },
  loaderCircle: {
    width: '50px',
    height: '50px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #085b6f',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px',
  },
  loaderText: {
    color: '#64748b',
    fontSize: '16px',
  },
  // Navbar Styles
  navbar: {
    backgroundColor: 'white',
    padding: '0',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    borderBottom: '1px solid #f1f5f9',
  },
  navContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 20px',
    height: '70px',
    position: 'relative',
  },
  logoLink: {
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    height: '40px',
  },
  // Text Logo (Fallback)
  textLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoEmoji: {
    fontSize: '32px',
    background: 'linear-gradient(135deg, #085b6f 0%, #8b5cf6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 'bold',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: 'bold',
    display: 'flex',
    flexDirection: 'column',
    lineHeight: '1.2',
  },
  logoPrimary: {
    color: '#1e293b',
    fontSize: '18px',
  },
  logoSecondary: {
    color: '#085b6f',
    fontSize: '20px',
    fontWeight: '800',
  },
  // Image Logo
  imageLogoContainer: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  logoImage: {
    height: '40px',
    width: 'auto',
    objectFit: 'contain',
  },
  menuToggle: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '10px',
    zIndex: 1001,
  },
  menuIcon: {
    display: 'block',
    width: '24px',
    height: '2px',
    backgroundColor: '#475569',
    position: 'relative',
  },
  menuIconBefore: {
    content: '""',
    position: 'absolute',
    width: '24px',
    height: '2px',
    backgroundColor: '#475569',
    left: '0',
    top: '-8px',
  },
  menuIconAfter: {
    content: '""',
    position: 'absolute',
    width: '24px',
    height: '2px',
    backgroundColor: '#475569',
    left: '0',
    bottom: '-8px',
  },
  menuIconOpen: {
    display: 'block',
    width: '24px',
    height: '2px',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  menuIconOpenBefore: {
    content: '""',
    position: 'absolute',
    width: '24px',
    height: '2px',
    backgroundColor: '#475569',
    left: '0',
    top: '0',
    transform: 'rotate(45deg)',
  },
  menuIconOpenAfter: {
    content: '""',
    position: 'absolute',
    width: '24px',
    height: '2px',
    backgroundColor: '#475569',
    left: '0',
    bottom: '0',
    transform: 'rotate(-45deg)',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  navLinksDesktop: {
    // Desktop styles - always visible
  },
  navLinksOpen: {
    // Mobile open state
    position: 'absolute',
    top: '70px',
    left: '0',
    right: '0',
    backgroundColor: 'white',
    flexDirection: 'column',
    padding: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    gap: '10px',
    zIndex: 1000,
  },
  navLinksHidden: {
    // Mobile closed state - hide on mobile
    display: 'none',
  },
  navItem: {
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '15px',
    padding: '12px 20px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
  },
  navItemHover: {
    color: '#085b6f',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    transform: 'translateY(-1px)',
  },
  navItemActive: {
    color: '#085b6f',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    fontWeight: '600',
  },
  navIcon: {
    fontSize: '18px',
  },
  navLabel: {
    fontSize: '14px',
    fontWeight: '500',
  },
  navActiveIndicator: {
    position: 'absolute',
    bottom: '0',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '4px',
    height: '4px',
    backgroundColor: '#085b6f',
    borderRadius: '50%',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginLeft: '15px',
    paddingLeft: '15px',
    borderLeft: '1px solid #e2e8f0',
  },
  userSectionMobile: {
    flexDirection: 'column',
    borderLeft: 'none',
    borderTop: '1px solid #e2e8f0',
    paddingTop: '15px',
    marginTop: '15px',
    width: '100%',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#085b6f',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0',
  },
  userEmail: {
    fontSize: '12px',
    color: '#64748b',
    margin: '0',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    border: '1px solid #e2e8f0',
    color: '#64748b',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s',
  },
  logoutButtonHover: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderColor: '#fca5a5',
  },
  logoutIcon: {
    fontSize: '16px',
  },
  logoutText: {
    fontSize: '14px',
  },
  // Main Content
  main: {
    flex: '1',
    padding: '30px 0 50px',
    minHeight: 'calc(100vh - 180px)',
  },
  // Footer Styles
  footer: {
    backgroundColor: '#1e293b',
    color: '#cbd5e1',
    padding: '30px 0',
    marginTop: 'auto',
  },
  footerContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    textAlign: 'center',
  },
  footerLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  footerLogoIcon: {
    fontSize: '24px',
    color: '#085b6f',
  },
  footerLogoImage: {
    height: '30px',
    width: 'auto',
    objectFit: 'contain',
  },
  footerLogoText: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  footerText: {
    fontSize: '14px',
    color: '#94a3b8',
    margin: '0',
  },
  footerLinks: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    fontSize: '14px',
  },
  footerLink: {
    color: '#cbd5e1',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
  footerLinkHover: {
    color: '#085b6f',
  },
  footerDivider: {
    color: '#475569',
  },
};

// Add CSS animations via global style
const addGlobalStyles = () => {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
        
      
      /* Mobile styles */
      @media (max-width: 768px) {
        .nav-links-mobile {
          position: absolute;
          top: 70px;
          left: 0;
          right: 0;
          background-color: white;
          flex-direction: column;
          padding: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          display: none;
          gap: 10px;
          z-index: 1000;
        }
        
        .nav-links-mobile.open {
          display: flex;
        }
        
        .user-section-mobile {
          flex-direction: column;
          border-left: none;
          border-top: 1px solid #e2e8f0;
          padding-top: 15px;
          margin-top: 15px;
          width: 100%;
        }
        
        .menu-toggle {
          display: block;
        }
        
        .menu-icon::before,
        .menu-icon::after {
          content: '';
          position: absolute;
          width: 24px;
          height: 2px;
          background-color: #475569;
          left: 0;
        }
        
        .menu-icon::before {
          top: -8px;
        }
        
        .menu-icon::after {
          bottom: -8px;
        }
        
        .menu-icon.open {
          background-color: transparent;
        }
        
        .menu-icon.open::before {
          top: 0;
          transform: rotate(45deg);
        }
        
        .menu-icon.open::after {
          bottom: 0;
          transform: rotate(-45deg);
        }
      }
      
      
      /* Desktop styles */
      @media (min-width: 769px) {
        .menu-toggle {
          display: none;
        }
        
        .nav-links-desktop {
          display: flex;
        }
      }
      
      /* Hover effects */
      .nav-item:hover {
        color: #085b6f;
        background-color: rgba(59, 130, 246, 0.05);
        transform: translateY(-1px);
      }
      
      .logout-button:hover {
        background-color: #fee2e2;
        color: #dc2626;
        border-color: #fca5a5;
      }
      
      .footer-link:hover {
        color: #085b6f;
      }
    `;
    document.head.appendChild(style);
  }
};

// Add global styles on component mount
addGlobalStyles();

export default Layout;