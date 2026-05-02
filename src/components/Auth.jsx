import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase, testConnection } from '../lib/supabase';

const Auth = ({ type }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [logoError, setLogoError] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const navigate = useNavigate();

  // Test connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      const result = await testConnection();
      setConnectionStatus(result);
      if (!result.success) {
        setError(`Cannot connect to server: ${result.error}. Please check your internet connection and Supabase configuration.`);
      }
    };
    checkConnection();
  }, []);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  setSuccess('');

  // Check if Supabase is configured
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    setError('Supabase is not configured. Please check your environment variables.');
    setLoading(false);
    return;
  }

  // Validate inputs
  if (!email.trim() || !password.trim()) {
    setError('Please fill in all fields');
    setLoading(false);
    return;
  }

  if (type === 'register' && !fullName.trim()) {
    setError('Please enter your full name');
    setLoading(false);
    return;
  }

  if (password.length < 6) {
    setError('Password must be at least 6 characters');
    setLoading(false);
    return;
  }

  try {
    if (type === 'register') {
      // Registration
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password.trim(),
        options: {
          data: {
            full_name: fullName.trim()
          }
        }
      });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        if (signUpError.message.includes('already registered')) {
          setError('An account with this email already exists. Please login instead.');
        } else if (signUpError.message.includes('Failed to fetch')) {
          setError('Network error. Please check your internet connection and try again.');
        } else {
          setError(signUpError.message);
        }
      } else if (data.user) {
        setSuccess('Registration successful! Please check your email to verify your account.');
        setTimeout(() => navigate('/login'), 3000);
      }
    } else {
      // Login
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      if (signInError) {
        console.error('Login error:', signInError);
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password');
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Please verify your email address before logging in.');
        } else if (signInError.message.includes('Failed to fetch')) {
          setError('Network error. Please check your internet connection.');
        } else {
          setError(signInError.message);
        }
      } else if (data.user) {
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => navigate('/'), 1000);
      }
    }
  } catch (err) {
    console.error('Auth error details:', err);
    if (err.message === 'Failed to fetch') {
      setError('Cannot connect to authentication server. Please check:\n1. Your internet connection\n2. Supabase configuration in .env file\n3. If Supabase project is active\n\nCheck console for details.');
    } else {
      setError(err.message);
    }
  } finally {
    setLoading(false);
  }
};

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setError('');
    setSuccess('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Left Side - Illustration */}
        <div style={styles.leftSide}>
          <div style={styles.illustration}>
            {logoError ? (
              <div style={styles.logoFallback}>
                <span style={styles.logoFallbackIcon}>💰</span>
                <h2 style={styles.logoFallbackText}>Budget Planner</h2>
              </div>
            ) : (
              <div style={styles.logoContainer}>
                <img 
                  src="/assets/logos/logo.png" 
                  alt="Budget Planner" 
                  style={styles.logoImage}
                  onError={() => setLogoError(true)}
                />
              </div>
            )}
            <h2 style={styles.illustrationTitle}>
              {type === 'login' ? 'Welcome Back!' : 'Start Your Journey'}
            </h2>
            <p style={styles.illustrationText}>
              {type === 'login' 
                ? 'Track your finances and achieve your goals'
                : 'Join thousands managing their budgets effectively'}
            </p>
          </div>
          
          <div style={styles.features}>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>📈</span>
              <span style={styles.featureText}>Track Income & Expenses</span>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>🎯</span>
              <span style={styles.featureText}>Set Budget Goals</span>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>🔒</span>
              <span style={styles.featureText}>Secure & Private</span>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div style={styles.rightSide}>
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              {logoError ? (
                <div style={styles.formLogoFallback}>
                  <span style={styles.formLogoText}>Budget Planner</span>
                </div>
              ) : (
                <div style={styles.formLogo}>
                  <img 
                    src="/assets/logos/logo.png" 
                    alt="Budget Planner" 
                    style={styles.formLogoImage}
                    onError={() => setLogoError(true)}
                  />
                </div>
              )}
              <h1 style={styles.title}>
                {type === 'login' ? 'Sign In to Your Account' : 'Create New Account'}
              </h1>
              <p style={styles.subtitle}>
                {type === 'login' 
                  ? 'Enter your credentials to continue'
                  : 'Fill in your details to get started'}
              </p>
            </div>

            {/* Connection Status (Debug) */}
            {connectionStatus && !connectionStatus.success && (
              <div style={styles.warningMessage}>
                <span style={styles.warningIcon}>⚠️</span>
                <span style={styles.warningText}>Connection issue: {connectionStatus.error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div style={styles.successMessage}>
                <span style={styles.successIcon}>✅</span>
                <span style={styles.successText}>{success}</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div style={styles.errorMessage}>
                <span style={styles.errorIcon}>⚠️</span>
                <span style={styles.errorText}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
              {type === 'register' && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <span style={styles.labelIcon}>👤</span>
                    Full Name
                  </label>
                  <input
                    type="text"
                    style={styles.input}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    required
                    disabled={loading}
                  />
                </div>
              )}

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <span style={styles.labelIcon}>📧</span>
                  Email Address
                </label>
                <input
                  type="email"
                  style={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <span style={styles.labelIcon}>🔒</span>
                  Password
                </label>
                <input
                  type="password"
                  style={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                {type === 'register' && (
                  <small style={styles.helpText}>
                    Must be at least 6 characters
                  </small>
                )}
              </div>

              <button 
                type="submit" 
                style={{
                  ...styles.submitButton,
                  ...(loading ? styles.submitButtonLoading : {})
                }}
                disabled={loading}
              >
                {loading ? (
                  <span style={styles.buttonLoading}>
                    <span style={styles.spinner}></span>
                    Processing...
                  </span>
                ) : (
                  <span style={styles.buttonText}>
                    {type === 'login' ? 'Sign In' : 'Create Account'}
                  </span>
                )}
              </button>
            </form>

            <div style={styles.divider}>
              <span style={styles.dividerLine}></span>
              <span style={styles.dividerText}>or</span>
              <span style={styles.dividerLine}></span>
            </div>

            <div style={styles.switchAuth}>
              <p style={styles.switchText}>
                {type === 'login' 
                  ? "Don't have an account?" 
                  : "Already have an account?"}
              </p>
              <Link 
                to={type === 'login' ? '/register' : '/login'} 
                style={styles.switchLink}
                onClick={clearForm}
              >
                {type === 'login' ? 'Create Account' : 'Sign In'}
              </Link>
            </div>

            <div style={styles.terms}>
              <p style={styles.termsText}>
                By continuing, you agree to our 
                <a href="#" style={styles.termsLink}> Terms</a> and 
                <a href="#" style={styles.termsLink}> Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add animation keyframes
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  },
  wrapper: {
    display: 'flex',
    maxWidth: '1000px',
    width: '100%',
    backgroundColor: 'white',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    minHeight: '600px',
  },
  leftSide: {
    flex: 1,
    background: 'linear-gradient(135deg, #085b6f 0%, #8b5cf6 100%)',
    padding: '50px 40px',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustration: {
    textAlign: 'center',
    marginBottom: '50px',
    width: '100%',
  },
  logoContainer: {
    marginBottom: '30px',
    display: 'flex',
    justifyContent: 'center',
  },
  logoImage: {
    height: '80px',
    width: 'auto',
    objectFit: 'contain',
    filter: 'brightness(0) invert(1)',
  },
  logoFallback: {
    marginBottom: '30px',
    textAlign: 'center',
  },
  logoFallbackIcon: {
    fontSize: '80px',
    display: 'block',
    marginBottom: '15px',
    opacity: 0.9,
  },
  logoFallbackText: {
    fontSize: '32px',
    fontWeight: 'bold',
    opacity: 0.9,
  },
  illustrationTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '15px',
    letterSpacing: '-0.5px',
  },
  illustrationText: {
    fontSize: '16px',
    opacity: 0.9,
    lineHeight: 1.6,
    maxWidth: '400px',
    margin: '0 auto',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%',
    maxWidth: '400px',
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  featureIcon: {
    fontSize: '24px',
    background: 'rgba(255,255,255,0.2)',
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: '16px',
    fontWeight: '500',
  },
  rightSide: {
    flex: 1.2,
    padding: '50px',
    display: 'flex',
    alignItems: 'center',
  },
  formCard: {
    width: '100%',
    maxWidth: '400px',
    margin: '0 auto',
  },
  formHeader: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  formLogo: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  formLogoImage: {
    height: '50px',
    width: 'auto',
    objectFit: 'contain',
  },
  formLogoFallback: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  formLogoIcon: {
    fontSize: '28px',
    background: 'linear-gradient(135deg, #085b6f 0%, #8b5cf6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  formLogoText: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#1e293b',
  },
  title: {
    fontSize: '28px',
    color: '#1e293b',
    marginBottom: '10px',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: '15px',
    color: '#64748b',
  },
  warningMessage: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
  },
  warningIcon: {
    fontSize: '18px',
  },
  warningText: {
    flex: 1,
  },
  successMessage: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
  },
  successIcon: {
    fontSize: '18px',
  },
  successText: {
    flex: 1,
  },
  errorMessage: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
  },
  errorIcon: {
    fontSize: '18px',
  },
  errorText: {
    flex: 1,
  },
  form: {
    marginBottom: '30px',
  },
  formGroup: {
    marginBottom: '25px',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
    color: '#475569',
    fontSize: '14px',
    fontWeight: '500',
  },
  labelIcon: {
    fontSize: '16px',
    opacity: 0.7,
  },
  input: {
    width: '100%',
    padding: '16px 20px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '16px',
    transition: 'all 0.3s',
    backgroundColor: '#f8fafc',
    outline: 'none',
    boxSizing: 'border-box',
  },
  helpText: {
    display: 'block',
    marginTop: '6px',
    color: '#94a3b8',
    fontSize: '12px',
  },
  submitButton: {
    width: '100%',
    padding: '18px',
    backgroundColor: '#085b6f',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    marginTop: '10px',
  },
  submitButtonLoading: {
    opacity: 0.8,
    cursor: 'not-allowed',
  },
  buttonLoading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  buttonText: {
    display: 'block',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '30px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    padding: '0 15px',
    color: '#94a3b8',
    fontSize: '14px',
  },
  switchAuth: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  switchText: {
    color: '#64748b',
    fontSize: '15px',
    marginBottom: '10px',
  },
  switchLink: {
    color: '#085b6f',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'color 0.2s',
    display: 'inline-block',
    padding: '8px 16px',
    borderRadius: '8px',
  },
  terms: {
    textAlign: 'center',
    paddingTop: '20px',
    borderTop: '1px solid #e2e8f0',
  },
  termsText: {
    color: '#94a3b8',
    fontSize: '13px',
    lineHeight: 1.5,
  },
  termsLink: {
    color: '#085b6f',
    textDecoration: 'none',
    margin: '0 3px',
  },
};

export default Auth;