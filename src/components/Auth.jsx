import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Auth = ({ type }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (type === 'register') {
        // SIMPLE REGISTRATION
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: {
              full_name: fullName.trim()
            }
          }
        });

        if (signUpError) {
          // Check if user already exists
          if (signUpError.message.includes('already registered')) {
            // Try to login instead
            const { error: loginError } = await supabase.auth.signInWithPassword({
              email: email.trim(),
              password: password.trim(),
            });
            
            if (loginError) {
              setError('Account already exists. Please use login page.');
            } else {
              setSuccess('Account already exists. Logging you in...');
              setTimeout(() => navigate('/'), 2000);
            }
          } else {
            setError(signUpError.message);
          }
        } else if (data.user) {
          // Registration successful
          setSuccess('Registration successful! Please check your email to verify your account.');
          
          // Auto login if email confirmation is disabled
          try {
            const { error: loginError } = await supabase.auth.signInWithPassword({
              email: email.trim(),
              password: password.trim(),
            });
            
            if (!loginError) {
              setSuccess('Registration successful! Logging you in...');
              setTimeout(() => navigate('/'), 2000);
            } else {
              setSuccess('Registration successful! Please login with your credentials.');
              setTimeout(() => navigate('/login'), 3000);
            }
          } catch (loginErr) {
            // Continue with success message
          }
        }
      } else {
        // SIMPLE LOGIN
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (signInError) {
          // Check specific errors
          if (signInError.message.includes('Invalid login credentials')) {
            setError('Invalid email or password');
          } else if (signInError.message.includes('Email not confirmed')) {
            setError('Please check your email to verify your account first');
          } else {
            setError(signInError.message);
          }
        } else if (data.user) {
          setSuccess('Login successful!');
          setTimeout(() => navigate('/'), 1000);
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
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
      <div className="card" style={styles.card}>
        <h1 style={styles.title}>
          {type === 'login' ? 'Login to Your Account' : 'Create New Account'}
        </h1>
        <p style={styles.subtitle}>
          {type === 'login' 
            ? 'Enter your credentials to access your budget' 
            : 'Fill in your details to get started'}
        </p>

        {success && (
          <div style={styles.success}>
            ✅ {success}
          </div>
        )}

        {error && (
          <div style={styles.error}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {type === 'register' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              minLength={6}
              disabled={loading}
            />
            {type === 'register' && (
              <small style={styles.helpText}>
                Must be at least 6 characters long
              </small>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={styles.submitButton}
            disabled={loading}
          >
            {loading ? (
              <span style={styles.loadingText}>
                <span style={styles.spinner}></span> Processing...
              </span>
            ) : type === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          {type === 'register' && (
            <div style={styles.tips}>
              <p style={styles.tipText}>💡 <strong>Important:</strong></p>
              <p style={styles.tipText}>After registration, check your email for verification link.</p>
              <p style={styles.tipText}>If email doesn't arrive, you can still login with your credentials.</p>
            </div>
          )}
        </form>

        <div style={styles.footer}>
          {type === 'login' ? (
            <>
              <p style={styles.footerText}>
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  style={styles.link}
                  onClick={clearForm}
                >
                  Create one here
                </Link>
              </p>
              <p style={styles.footerHelp}>
                Forgot password? Check your email or create a new account.
              </p>
            </>
          ) : (
            <>
              <p style={styles.footerText}>
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  style={styles.link}
                  onClick={clearForm}
                >
                  Sign in here
                </Link>
              </p>
              <p style={styles.footerHelp}>
                Make sure to use a valid email address for verification.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 200px)',
    padding: '20px',
    backgroundColor: '#f8fafc',
  },
  card: {
    width: '100%',
    maxWidth: '450px',
    padding: '40px 30px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '28px',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: '10px',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: '16px',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: '30px',
    lineHeight: '1.5',
  },
  submitButton: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    marginTop: '10px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#3b82f6',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  submitButtonHover: {
    backgroundColor: '#2563eb',
    transform: 'translateY(-1px)',
  },
  loadingText: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  helpText: {
    display: 'block',
    marginTop: '6px',
    color: '#64748b',
    fontSize: '12px',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    borderLeft: '4px solid #ef4444',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  success: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    borderLeft: '4px solid #10b981',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  tips: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#f0f9ff',
    borderRadius: '8px',
    border: '1px solid #bae6fd',
  },
  tipText: {
    fontSize: '13px',
    color: '#0369a1',
    marginBottom: '5px',
    lineHeight: '1.4',
  },
  footer: {
    marginTop: '30px',
    textAlign: 'center',
    paddingTop: '20px',
    borderTop: '1px solid #e2e8f0',
  },
  footerText: {
    color: '#475569',
    fontSize: '15px',
    marginBottom: '10px',
  },
  footerHelp: {
    color: '#94a3b8',
    fontSize: '13px',
    fontStyle: 'italic',
  },
  link: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'color 0.2s',
  },
  linkHover: {
    color: '#2563eb',
    textDecoration: 'underline',
  },
};

// Add CSS animation
const styleSheet = document.styleSheets[0];
if (styleSheet) {
  styleSheet.insertRule(`
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `, styleSheet.cssRules.length);
}

export default Auth;