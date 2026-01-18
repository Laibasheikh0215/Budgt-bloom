import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Auth = ({ type }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (type === 'register') {
        // REGISTRATION with auto-confirm for development
        console.log('Registering user:', email);
        
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password: password.trim(),
          options: {
            data: {
              full_name: fullName.trim()
            },
            // Don't redirect, auto-confirm for development
            emailRedirectTo: window.location.origin
          }
        });

        if (signUpError) {
          console.error('Registration error:', signUpError);
          
          // If user already exists, try to login
          if (signUpError.message.includes('already registered')) {
            const { error: loginError } = await supabase.auth.signInWithPassword({
              email: email.trim().toLowerCase(),
              password: password.trim(),
            });
            
            if (loginError) throw loginError;
            alert('Welcome back! You are now logged in.');
            navigate('/');
            return;
          }
          
          throw signUpError;
        }

        console.log('Registration data:', data);
        
        if (data.user) {
          // Auto login after registration
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password: password.trim(),
          });
          
          if (loginError) {
            console.log('Auto-login failed, trying magic link...');
            // Try magic link as fallback
            const { error: magicError } = await supabase.auth.signInWithOtp({
              email: email.trim().toLowerCase(),
              options: {
                emailRedirectTo: window.location.origin,
                shouldCreateUser: false
              }
            });
            
            if (magicError) throw magicError;
            alert('Registration successful! Check your email for verification link.');
          } else {
            alert('Registration successful! You are now logged in.');
            navigate('/');
          }
        }
      } else {
        // LOGIN with better error handling
        console.log('Logging in user:', email);
        
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: password.trim(),
        });

        if (signInError) {
          console.error('Login error:', signInError);
          
          // Check specific error types
          if (signInError.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password. Please try again.');
          } else if (signInError.message.includes('Email not confirmed')) {
            throw new Error('Please confirm your email first. Check your inbox.');
          } else if (signInError.message.includes('User not found')) {
            // Try to register if user doesn't exist
            const { error: registerError } = await supabase.auth.signUp({
              email: email.trim().toLowerCase(),
              password: password.trim(),
              options: {
                emailRedirectTo: window.location.origin
              }
            });
            
            if (registerError) throw registerError;
            throw new Error('Account created! Please check your email to confirm.');
          }
          
          throw signInError;
        }

        console.log('Login successful:', data.user);
        
        if (data.user) {
          alert(`Welcome back, ${data.user.email || data.user.user_metadata?.full_name || 'User'}!`);
          navigate('/');
        }
      }
    } catch (err) {
      console.error('Auth error details:', err);
      setError(err.message || 'An error occurred during authentication');
      
      // Show specific help based on error
      if (err.message.includes('confirm your email')) {
        setError(err.message + ' Or use Magic Link login.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError('Please enter your email first');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: window.location.origin,
          shouldCreateUser: type === 'register' // Create user if registering
        },
      });

      if (error) throw error;
      
      alert(`Magic link sent to ${email}! Check your email to login.`);
    } catch (err) {
      setError(err.message || 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  const handleTestAccount = async () => {
    setLoading(true);
    setError(null);
    
    const testEmail = `test${Date.now()}@budgetapp.com`;
    const testPassword = 'Test@12345';
    setEmail(testEmail);
    setPassword(testPassword);
    
    if (type === 'register') {
      setFullName('Test User');
    }

    try {
      // Create test account
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            full_name: 'Test User'
          },
          emailRedirectTo: window.location.origin
        }
      });

      if (signUpError && !signUpError.message.includes('already registered')) {
        throw signUpError;
      }

      // Auto login
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (loginError) throw loginError;
      
      alert(`Test account created! Logged in as ${testEmail}`);
      navigate('/');
    } catch (err) {
      console.error('Test account error:', err);
      setError('Failed to create test account. Try magic link instead.');
      
      // Try magic link as fallback
      await handleMagicLink();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="card" style={styles.card}>
        <h1 style={styles.title}>
          {type === 'login' ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p style={styles.subtitle}>
          {type === 'login' 
            ? 'Sign in to track your finances' 
            : 'Create your account to start budgeting'}
        </p>

        <form onSubmit={handleSubmit}>
          {type === 'register' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
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
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
            {type === 'register' && (
              <small style={styles.helpText}>
                Password must be at least 6 characters
              </small>
            )}
          </div>

          {error && (
            <div style={styles.error}>
              <strong>Error:</strong> {error}
            </div>
          )}

          <div style={styles.buttonGroup}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Processing...' : type === 'login' ? 'Sign In' : 'Create Account'}
            </button>
            
            <button 
              type="button"
              onClick={handleMagicLink}
              className="btn btn-secondary"
              style={styles.magicButton}
              disabled={loading || !email}
            >
              Send Magic Link
            </button>
          </div>
        </form>

        <div style={styles.testSection}>
          <p style={styles.testText}>For quick testing:</p>
          <button 
            type="button"
            onClick={handleTestAccount}
            className="btn btn-success"
            style={styles.testButton}
            disabled={loading}
          >
            Create Test Account
          </button>
        </div>

        <div style={styles.footer}>
          {type === 'login' ? (
            <p style={styles.footerText}>
              Don't have an account?{' '}
              <Link to="/register" style={styles.link}>
                Register here
              </Link>
            </p>
          ) : (
            <p style={styles.footerText}>
              Already have an account?{' '}
              <Link to="/login" style={styles.link}>
                Sign in here
              </Link>
            </p>
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
  },
  card: {
    width: '100%',
    maxWidth: '450px',
    padding: '30px',
  },
  title: {
    fontSize: '28px',
    color: '#212121',
    textAlign: 'center',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    textAlign: 'center',
    marginBottom: '30px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
  },
  submitButton: {
    flex: 2,
  },
  magicButton: {
    flex: 1,
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  helpText: {
    display: 'block',
    marginTop: '5px',
    color: '#666',
    fontSize: '12px',
  },
  error: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    color: '#f44336',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '15px',
    fontSize: '14px',
    borderLeft: '4px solid #f44336',
  },
  testSection: {
    marginTop: '25px',
    paddingTop: '20px',
    borderTop: '1px solid #eee',
    textAlign: 'center',
  },
  testText: {
    color: '#666',
    fontSize: '14px',
    marginBottom: '10px',
  },
  testButton: {
    width: '100%',
  },
  footer: {
    marginTop: '30px',
    textAlign: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: '14px',
  },
  link: {
    color: '#2196F3',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
};

export default Auth;