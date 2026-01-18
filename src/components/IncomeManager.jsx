import React, { useState, useEffect } from 'react';
import { database, supabase } from '../lib/supabase';

const IncomeManager = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    source: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    checkUserAndFetchData();
  }, []);

  const checkUserAndFetchData = async () => {
    setLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        await fetchIncomes();
      } else {
        console.log('No user found for income manager');
      }
    } catch (error) {
      console.error('Error in income manager:', error);
    }
    setLoading(false);
  };

  const fetchIncomes = async () => {
    try {
      const data = await database.getIncomes();
      console.log('Incomes fetched:', data);
      setIncomes(data);
    } catch (error) {
      console.error('Error fetching incomes:', error);
      alert('Error loading incomes: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.source || !formData.amount) {
      alert('Please fill all fields');
      return;
    }
    
    if (!user) {
      alert('Please login first!');
      return;
    }
    
    const incomeData = {
      source: formData.source.trim(),
      amount: parseFloat(formData.amount),
      date: formData.date,
    };

    console.log('Adding income:', incomeData);

    try {
      const newIncome = await database.addIncome(incomeData);
      
      if (newIncome) {
        console.log('Income added successfully:', newIncome);
        setIncomes([newIncome, ...incomes]);
        setFormData({ 
          source: '', 
          amount: '', 
          date: new Date().toISOString().split('T')[0] 
        });
        alert('✅ Income added successfully!');
      } else {
        alert('Failed to add income. Please try again.');
      }
    } catch (error) {
      console.error('Error adding income:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income?')) return;
    
    console.log('Deleting income ID:', id);
    
    try {
      const success = await database.deleteIncome(id);
      
      if (success) {
        setIncomes(incomes.filter(income => income.id !== id));
        alert('✅ Income deleted successfully!');
      } else {
        alert('Failed to delete income.');
      }
    } catch (error) {
      console.error('Error deleting income:', error);
      alert('Error: ' + error.message);
    }
  };

  const addSampleIncomes = async () => {
    if (!window.confirm('Add sample income data?')) return;
    
    const sampleIncomes = [
      { source: 'Salary', amount: 5000, date: new Date().toISOString().split('T')[0] },
      { source: 'Freelance Work', amount: 1200, date: new Date().toISOString().split('T')[0] },
      { source: 'Investment Dividends', amount: 300, date: new Date().toISOString().split('T')[0] },
    ];
    
    setLoading(true);
    try {
      for (const income of sampleIncomes) {
        await database.addIncome(income);
      }
      alert('Sample incomes added! Refreshing...');
      await fetchIncomes();
    } catch (error) {
      console.error('Error adding sample incomes:', error);
      alert('Error: ' + error.message);
    }
    setLoading(false);
  };

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading income data...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={styles.noUserContainer}>
        <h2>Please Login</h2>
        <p>You need to be logged in to manage income.</p>
        <button 
          onClick={() => window.location.href = '/login'}
          style={styles.loginButton}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 style={styles.title}>Income Management</h1>
      
      <div className="card">
        <h2 style={styles.formTitle}>Add New Income</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Income Source *</label>
            <input
              type="text"
              className="form-control"
              value={formData.source}
              onChange={(e) => setFormData({...formData, source: e.target.value})}
              placeholder="Salary, Freelance, Investment..."
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Amount ($) *</label>
            <input
              type="number"
              className="form-control"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-control"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
          </div>
          
          <div style={styles.formButtons}>
            <button type="submit" className="btn btn-success" style={styles.submitButton}>
              Add Income
            </button>
            <button 
              type="button"
              onClick={addSampleIncomes}
              className="btn btn-info"
              style={styles.sampleButton}
            >
              Add Sample Data
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div style={styles.summaryHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Income Summary</h2>
            <p style={styles.recordCount}>{incomes.length} income records</p>
          </div>
          <div style={styles.totalIncome}>
            Total: <span style={styles.totalAmount}>${totalIncome.toFixed(2)}</span>
          </div>
        </div>

        {incomes.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.noData}>No income records yet.</p>
            <p style={styles.emptyMessage}>Add your first income to get started!</p>
            <button 
              onClick={addSampleIncomes}
              className="btn btn-primary"
              style={{ marginTop: '15px' }}
            >
              Add Sample Incomes
            </button>
          </div>
        ) : (
          <div style={styles.incomeList}>
            {incomes.map((income) => (
              <div key={income.id} className="income-bg" style={styles.incomeItem}>
                <div style={styles.incomeContent}>
                  <div style={styles.incomeInfo}>
                    <h3 style={styles.incomeSource}>{income.source}</h3>
                    <p style={styles.incomeDate}>
                      {new Date(income.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div style={styles.incomeActions}>
                    <span style={styles.incomeAmount}>${income.amount.toFixed(2)}</span>
                    <button 
                      onClick={() => handleDelete(income.id)}
                      style={styles.deleteButton}
                      title="Delete income"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  title: {
    fontSize: '32px',
    color: '#212121',
    marginBottom: '20px',
  },
  formTitle: {
    fontSize: '24px',
    marginBottom: '20px',
    color: '#212121',
  },
  formButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
  },
  submitButton: {
    flex: 2,
  },
  sampleButton: {
    flex: 1,
  },
  summaryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px',
  },
  sectionTitle: {
    fontSize: '24px',
    color: '#212121',
    marginBottom: '5px',
  },
  recordCount: {
    fontSize: '14px',
    color: '#666',
  },
  totalIncome: {
    fontSize: '18px',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: '10px 20px',
    borderRadius: '8px',
  },
  totalAmount: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: '24px',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '40px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #F5F5F5',
    borderTop: '4px solid #4CAF50',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px',
  },
  noUserContainer: {
    textAlign: 'center',
    padding: '40px',
  },
  loginButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '15px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
  },
  noData: {
    color: '#666',
    fontSize: '18px',
    marginBottom: '10px',
  },
  emptyMessage: {
    color: '#999',
    fontSize: '14px',
  },
  incomeList: {
    maxHeight: '500px',
    overflowY: 'auto',
    paddingRight: '10px',
  },
  incomeItem: {
    padding: '15px',
    marginBottom: '10px',
    borderRadius: '8px',
    backgroundColor: 'white',
    border: '1px solid #EEEEEE',
    borderLeft: '4px solid #4CAF50',
    transition: 'all 0.3s ease',
  },
  incomeContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  incomeInfo: {
    flex: 1,
  },
  incomeSource: {
    fontSize: '16px',
    color: '#212121',
    marginBottom: '5px',
  },
  incomeDate: {
    fontSize: '14px',
    color: '#666',
  },
  incomeAmount: {
    fontSize: '20px',
    color: '#4CAF50',
    fontWeight: 'bold',
    marginRight: '15px',
  },
  incomeActions: {
    display: 'flex',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF5722',
    color: 'white',
    border: 'none',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
};

export default IncomeManager;