import React, { useState, useEffect } from 'react';
import { supabase, testConnection } from '../lib/supabase';

const TestSupabase = () => {
  const [connectionStatus, setConnectionStatus] = useState('Testing...');
  const [tables, setTables] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    testSupabase();
  }, []);

  const testSupabase = async () => {
    console.log("🔍 Starting Supabase test...");
    
    // Test 1: Environment variables
    console.log("Env Vars:");
    console.log("URL:", import.meta.env.VITE_SUPABASE_URL);
    console.log("Key:", import.meta.env.VITE_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing");
    
    // Test 2: Connection
    const result = await testConnection();
    setConnectionStatus(result.success ? '✅ Connected' : `❌ Failed: ${result.error}`);
    
    // Test 3: Get user
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user) {
      // Test 4: Check tables
      try {
        const { data: incomeData } = await supabase
          .from('income')
          .select('count')
          .single();
        
        setTables(prev => [...prev, `Income table: ${incomeData?.count || 0} rows`]);
      } catch (err) {
        setTables(prev => [...prev, "❌ Income table error"]);
      }
    }
  };

  const handleLogin = async () => {
    // Test login with dummy credentials
    const { error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password123'
    });
    
    if (error) {
      // If login fails, try to sign up
      const { error: signUpError } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'password123'
      });
      
      if (signUpError) {
        console.error("Sign up error:", signUpError);
      } else {
        alert("Test account created! Please verify your email.");
      }
    }
    
    testSupabase();
  };

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f0f9ff',
      borderRadius: '10px',
      margin: '20px',
      border: '1px solid #bae6fd'
    }}>
      <h2>🔧 Supabase Connection Test</h2>
      
      <div style={styles.card}>
        <h3>Status</h3>
        <p style={{
          color: connectionStatus.includes('✅') ? 'green' : 'red',
          fontWeight: 'bold'
        }}>
          {connectionStatus}
        </p>
      </div>
      
      <div style={styles.card}>
        <h3>User Status</h3>
        {user ? (
          <div>
            <p>✅ Logged in as: {user.email}</p>
            <p>ID: {user.id.substring(0, 8)}...</p>
          </div>
        ) : (
          <div>
            <p>❌ Not logged in</p>
            <button onClick={handleLogin} style={styles.button}>
              Create Test Account
            </button>
          </div>
        )}
      </div>
      
      <div style={styles.card}>
        <h3>Database Tables</h3>
        {tables.length === 0 ? (
          <p>Testing tables...</p>
        ) : (
          <ul>
            {tables.map((table, idx) => (
              <li key={idx}>{table}</li>
            ))}
          </ul>
        )}
      </div>
      
      <div style={styles.card}>
        <h3>Actions</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={testSupabase} style={styles.button}>
            Test Again
          </button>
          <button onClick={() => supabase.auth.signOut()} style={styles.button}>
            Logout
          </button>
          <button onClick={() => window.location.reload()} style={styles.button}>
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '15px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  button: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
  }
};

export default TestSupabase;