import React, { useState, useEffect } from 'react';
import { database, supabase } from '../lib/supabase';

const BudgetManager = () => {
  const categories = [
    'Food & Dining',
    'Rent & Mortgage',
    'Transportation',
    'Utilities',
    'Healthcare',
    'Entertainment',
    'Shopping',
    'Education',
    'Personal Care',
    'Other'
  ];

  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    monthly_limit: '',
  });

  useEffect(() => {
    checkUserAndFetchData();
  }, []);

  const checkUserAndFetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error in budget manager:', error);
    }
    setLoading(false);
  };

  const fetchData = async () => {
    try {
      console.log('Fetching budgets and expenses...');
      const budgetsData = await database.getBudgets();
      const expensesData = await database.getExpenses();
      
      console.log('Budgets fetched:', budgetsData);
      console.log('Expenses fetched:', expensesData);
      
      setBudgets(budgetsData);
      setExpenses(expensesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error loading data: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.monthly_limit) {
      alert('Please fill all fields');
      return;
    }
    
    if (!user) {
      alert('Please login first!');
      return;
    }
    
    const budgetData = {
      category: formData.category,
      monthly_limit: parseFloat(formData.monthly_limit),
    };

    console.log('Adding budget:', budgetData);

    try {
      const newBudget = await database.addBudget(budgetData);
      
      if (newBudget) {
        console.log('Budget added successfully:', newBudget);
        setBudgets([...budgets, newBudget]);
        setFormData({ category: '', monthly_limit: '' });
        alert('✅ Budget set successfully!');
      } else {
        alert('Failed to add budget. Please try again.');
      }
    } catch (error) {
      console.error('Error adding budget:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
    
    console.log('Deleting budget ID:', id);
    
    try {
      const success = await database.deleteBudget(id);
      
      if (success) {
        setBudgets(budgets.filter(b => b.id !== id));
        alert('✅ Budget deleted successfully!');
      } else {
        alert('Failed to delete budget.');
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
      alert('Error: ' + error.message);
    }
  };

  const getCategorySpending = (category) => {
    return expenses
      .filter(exp => exp.category === category)
      .reduce((sum, exp) => sum + exp.amount, 0);
  };

  const calculateRemaining = (budget) => {
    const spent = getCategorySpending(budget.category);
    return budget.monthly_limit - spent;
  };

  const getProgressPercentage = (budget) => {
    const spent = getCategorySpending(budget.category);
    if (budget.monthly_limit === 0) return 0;
    return Math.min((spent / budget.monthly_limit) * 100, 100);
  };

  const getProgressColor = (percentage) => {
    if (percentage < 70) return '#4CAF50';
    if (percentage < 90) return '#FF9800';
    return '#FF5722';
  };

  const getRemainingCategories = () => {
    const usedCategories = budgets.map(b => b.category);
    return categories.filter(cat => !usedCategories.includes(cat));
  };

  // Calculate overall budget stats
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.monthly_limit, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + getCategorySpending(budget.category), 0);
  const overallRemaining = totalBudget - totalSpent;
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const addSampleBudgets = async () => {
    if (!window.confirm('Add sample budget data?')) return;
    
    const sampleBudgets = [
      { category: 'Food & Dining', monthly_limit: 500 },
      { category: 'Transportation', monthly_limit: 200 },
      { category: 'Entertainment', monthly_limit: 100 },
    ];
    
    setLoading(true);
    try {
      for (const budget of sampleBudgets) {
        await database.addBudget(budget);
      }
      alert('Sample budgets added! Refreshing...');
      await fetchData();
    } catch (error) {
      console.error('Error adding sample budgets:', error);
      alert('Error: ' + error.message);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading budget data...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={styles.noUserContainer}>
        <h2>Please Login</h2>
        <p>You need to be logged in to manage budgets.</p>
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
      <h1 style={styles.title}>Monthly Budgets</h1>
      
      {/* Overall Budget Summary */}
      <div className="card" style={styles.overallSummary}>
        <h2 style={styles.summaryTitle}>Overall Budget Summary</h2>
        <div style={styles.summaryStats}>
          <div style={styles.statBox}>
            <span style={styles.statLabel}>Total Budget</span>
            <span style={styles.statValue}>${totalBudget.toFixed(2)}</span>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statLabel}>Total Spent</span>
            <span style={styles.statValue}>${totalSpent.toFixed(2)}</span>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statLabel}>Remaining</span>
            <span style={{
              ...styles.statValue,
              color: overallRemaining >= 0 ? '#4CAF50' : '#FF5722'
            }}>
              ${overallRemaining.toFixed(2)}
            </span>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statLabel}>Progress</span>
            <span style={styles.statValue}>{overallPercentage.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={styles.formTitle}>Set New Budget</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-control"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
              disabled={getRemainingCategories().length === 0}
            >
              <option value="">Select a category</option>
              {getRemainingCategories().map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {getRemainingCategories().length === 0 && (
              <small style={styles.helpText}>All categories have budgets set</small>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">Monthly Limit ($)</label>
            <input
              type="number"
              className="form-control"
              value={formData.monthly_limit}
              onChange={(e) => setFormData({...formData, monthly_limit: e.target.value})}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div style={styles.formButtons}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={styles.submitButton}
              disabled={!formData.category || !formData.monthly_limit || getRemainingCategories().length === 0}
            >
              Set Budget
            </button>
            <button 
              type="button"
              onClick={addSampleBudgets}
              className="btn btn-info"
              style={styles.sampleButton}
            >
              Add Sample Budgets
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Your Budgets</h2>
            <p style={styles.recordCount}>{budgets.length} budgets set</p>
          </div>
          <span style={styles.countBadge}>
            {getRemainingCategories().length} categories available
          </span>
        </div>
        
        {budgets.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.noData}>No budgets set yet</p>
            <p style={styles.emptyMessage}>Create your first budget to start tracking!</p>
            <button 
              onClick={addSampleBudgets}
              className="btn btn-primary"
              style={{ marginTop: '15px' }}
            >
              Add Sample Budgets
            </button>
          </div>
        ) : (
          <div style={styles.budgetsGrid}>
            {budgets.map((budget) => {
              const spent = getCategorySpending(budget.category);
              const remaining = calculateRemaining(budget);
              const percentage = getProgressPercentage(budget);
              const progressColor = getProgressColor(percentage);
              
              return (
                <div key={budget.id} className="card" style={styles.budgetCard}>
                  <div style={styles.budgetHeader}>
                    <div>
                      <h3 style={styles.budgetCategory}>{budget.category}</h3>
                      <p style={styles.budgetPeriod}>Monthly Budget</p>
                    </div>
                    <button 
                      onClick={() => handleDelete(budget.id)}
                      style={styles.deleteButton}
                      title="Delete budget"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div style={styles.budgetProgress}>
                    <div style={styles.progressBar}>
                      <div 
                        style={{
                          ...styles.progressFill,
                          width: `${percentage}%`,
                          backgroundColor: progressColor,
                        }}
                      />
                    </div>
                    <div style={styles.progressText}>
                      <span style={styles.progressPercentage}>
                        {percentage.toFixed(1)}%
                      </span>
                      <span style={styles.progressLabel}>
                        of budget used
                      </span>
                    </div>
                  </div>
                  
                  <div style={styles.budgetDetails}>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Budget Limit:</span>
                      <span style={styles.detailValue}>
                        ${budget.monthly_limit.toFixed(2)}
                      </span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Amount Spent:</span>
                      <span style={styles.detailValue}>
                        ${spent.toFixed(2)}
                      </span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Remaining:</span>
                      <span style={{
                        ...styles.detailValue,
                        color: remaining >= 0 ? '#4CAF50' : '#FF5722',
                        fontWeight: 'bold',
                      }}>
                        ${remaining.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div style={styles.budgetStatus}>
                    {remaining >= 0 ? (
                      <div style={styles.statusGood}>
                        <span style={styles.statusIcon}>🎉</span>
                        <span>You're within budget! ${remaining.toFixed(2)} left</span>
                      </div>
                    ) : (
                      <div style={styles.statusWarning}>
                        <span style={styles.statusIcon}>⚠️</span>
                        <span>Over budget by ${Math.abs(remaining).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="card">
        <h2 style={styles.sectionTitle}>Budget Tips</h2>
        <div style={styles.tipsContainer}>
          <div style={styles.tip}>
            <span style={styles.tipIcon}>💡</span>
            <h4 style={styles.tipTitle}>Start with Essentials</h4>
            <p>Begin with categories like rent, groceries, and utilities before adding discretionary spending.</p>
          </div>
          <div style={styles.tip}>
            <span style={styles.tipIcon}>💰</span>
            <h4 style={styles.tipTitle}>Save 20% Rule</h4>
            <p>Aim to save at least 20% of your income each month for emergencies and future goals.</p>
          </div>
          <div style={styles.tip}>
            <span style={styles.tipIcon}>📊</span>
            <h4 style={styles.tipTitle}>Weekly Reviews</h4>
            <p>Review your budgets weekly and adjust as needed to stay on track.</p>
          </div>
          <div style={styles.tip}>
            <span style={styles.tipIcon}>🎯</span>
            <h4 style={styles.tipTitle}>Realistic Goals</h4>
            <p>Set realistic goals - it's better to start small and build up gradually.</p>
          </div>
        </div>
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
  overallSummary: {
    marginBottom: '20px',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    border: '1px solid rgba(33, 150, 243, 0.2)',
  },
  summaryTitle: {
    fontSize: '20px',
    marginBottom: '15px',
    color: '#2196F3',
    textAlign: 'center',
  },
  summaryStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  },
  statBox: {
    textAlign: 'center',
    padding: '15px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  statLabel: {
    display: 'block',
    fontSize: '12px',
    color: '#666',
    marginBottom: '5px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statValue: {
    display: 'block',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#212121',
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
  helpText: {
    display: 'block',
    marginTop: '5px',
    color: '#FF9800',
    fontSize: '12px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  countBadge: {
    backgroundColor: '#2196F3',
    color: 'white',
    padding: '5px 15px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  noData: {
    textAlign: 'center',
    color: '#666',
    padding: '40px',
    fontSize: '18px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
  },
  emptyMessage: {
    color: '#999',
    fontSize: '14px',
    marginTop: '10px',
  },
  budgetsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  budgetCard: {
    border: '1px solid #EEEEEE',
    transition: 'all 0.3s ease',
    padding: '20px',
  },
  budgetHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px',
  },
  budgetCategory: {
    fontSize: '18px',
    color: '#212121',
    marginBottom: '5px',
  },
  budgetPeriod: {
    fontSize: '12px',
    color: '#666',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    padding: '2px 8px',
    borderRadius: '10px',
    display: 'inline-block',
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
  budgetProgress: {
    marginBottom: '20px',
  },
  progressBar: {
    height: '10px',
    backgroundColor: '#EEEEEE',
    borderRadius: '5px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  progressFill: {
    height: '100%',
    borderRadius: '5px',
    transition: 'width 0.3s ease',
  },
  progressText: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    color: '#666',
  },
  progressPercentage: {
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#212121',
  },
  progressLabel: {
    fontSize: '11px',
  },
  budgetDetails: {
    marginBottom: '15px',
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    fontSize: '14px',
    paddingBottom: '8px',
    borderBottom: '1px solid #F5F5F5',
  },
  detailLabel: {
    color: '#666',
  },
  detailValue: {
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  budgetStatus: {
    padding: '12px',
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: '14px',
    marginTop: '10px',
  },
  statusGood: {
    color: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  statusWarning: {
    color: '#FF5722',
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  statusIcon: {
    fontSize: '16px',
  },
  tipsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  tip: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    padding: '20px',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
  },
  tipIcon: {
    fontSize: '32px',
    display: 'block',
    marginBottom: '15px',
  },
  tipTitle: {
    fontSize: '16px',
    color: '#2196F3',
    marginBottom: '10px',
  },
  tipP: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.5',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '40px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #F5F5F5',
    borderTop: '4px solid #2196F3',
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
};

export default BudgetManager;