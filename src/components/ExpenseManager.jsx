import React, { useState, useEffect } from 'react';
import { database, supabase } from '../lib/supabase';

const ExpenseManager = () => {
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

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    category: categories[0],
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
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
        await fetchExpenses();
      }
    } catch (error) {
      console.error('Error in expense manager:', error);
    }
    setLoading(false);
  };

  const fetchExpenses = async () => {
    try {
      const data = await database.getExpenses();
      console.log('Expenses fetched:', data);
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      alert('Error loading expenses: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) {
      alert('Please fill all required fields');
      return;
    }
    
    if (!user) {
      alert('Please login first!');
      return;
    }
    
    const expenseData = {
      category: formData.category,
      description: formData.description.trim(),
      amount: parseFloat(formData.amount),
      date: formData.date,
    };

    console.log('Adding expense:', expenseData);

    try {
      const newExpense = await database.addExpense(expenseData);
      
      if (newExpense) {
        console.log('Expense added successfully:', newExpense);
        setExpenses([newExpense, ...expenses]);
        setFormData({
          category: categories[0],
          description: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
        });
        alert('✅ Expense added successfully!');
      } else {
        alert('Failed to add expense. Please try again.');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    
    console.log('Deleting expense ID:', id);
    
    try {
      const success = await database.deleteExpense(id);
      
      if (success) {
        setExpenses(expenses.filter(expense => expense.id !== id));
        alert('✅ Expense deleted successfully!');
      } else {
        alert('Failed to delete expense.');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Error: ' + error.message);
    }
  };

  const addSampleExpenses = async () => {
    if (!window.confirm('Add sample expense data?')) return;
    
    const sampleExpenses = [
      { category: 'Food & Dining', description: 'Grocery Shopping', amount: 150, date: new Date().toISOString().split('T')[0] },
      { category: 'Utilities', description: 'Electricity Bill', amount: 80, date: new Date().toISOString().split('T')[0] },
      { category: 'Transportation', description: 'Fuel', amount: 60, date: new Date().toISOString().split('T')[0] },
      { category: 'Entertainment', description: 'Netflix Subscription', amount: 15, date: new Date().toISOString().split('T')[0] },
    ];
    
    setLoading(true);
    try {
      for (const expense of sampleExpenses) {
        await database.addExpense(expense);
      }
      alert('Sample expenses added! Refreshing...');
      await fetchExpenses();
    } catch (error) {
      console.error('Error adding sample expenses:', error);
      alert('Error: ' + error.message);
    }
    setLoading(false);
  };

  const getCategoryTotal = (category) => {
    return expenses
      .filter(exp => exp.category === category)
      .reduce((sum, exp) => sum + exp.amount, 0);
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading expense data...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={styles.noUserContainer}>
        <h2>Please Login</h2>
        <p>You need to be logged in to manage expenses.</p>
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
      <h1 style={styles.title}>Expense Management</h1>
      
      <div className="card">
        <h2 style={styles.formTitle}>Add New Expense</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-control"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Description *</label>
            <input
              type="text"
              className="form-control"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="What was this expense for?"
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
            <button type="submit" className="btn btn-danger" style={styles.submitButton}>
              Add Expense
            </button>
            <button 
              type="button"
              onClick={addSampleExpenses}
              className="btn btn-info"
              style={styles.sampleButton}
            >
              Add Sample Data
            </button>
          </div>
        </form>
      </div>

      <div style={styles.summarySection}>
        <div className="card">
          <h2 style={styles.sectionTitle}>Expense Summary</h2>
          <div style={styles.totalExpense}>
            Total Spent: <span style={styles.totalAmount}>${totalExpenses.toFixed(2)}</span>
          </div>
          
          <div style={styles.categorySummary}>
            <h3 style={styles.subTitle}>Spending by Category</h3>
            {categories.map(category => {
              const total = getCategoryTotal(category);
              const percentage = totalExpenses > 0 ? (total / totalExpenses) * 100 : 0;
              
              return (
                <div key={category} style={styles.categoryItem}>
                  <div style={styles.categoryHeader}>
                    <span style={styles.categoryName}>{category}</span>
                    <span style={styles.categoryAmount}>${total.toFixed(2)}</span>
                  </div>
                  <div style={styles.categoryBarContainer}>
                    <div 
                      style={{
                        ...styles.categoryBar,
                        width: `${percentage}%`,
                        backgroundColor: '#FF5722',
                      }}
                    />
                  </div>
                  <span style={styles.categoryPercentage}>
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div style={styles.listHeader}>
            <h2 style={styles.sectionTitle}>Recent Expenses</h2>
            <span style={styles.countBadge}>{expenses.length} expenses</span>
          </div>
          
          {expenses.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.noData}>No expense records yet</p>
              <p style={styles.emptyMessage}>Add your first expense to start tracking!</p>
              <button 
                onClick={addSampleExpenses}
                className="btn btn-primary"
                style={{ marginTop: '15px' }}
              >
                Add Sample Expenses
              </button>
            </div>
          ) : (
            <div style={styles.expenseList}>
              {expenses.map((expense) => (
                <div key={expense.id} className="expense-bg" style={styles.expenseItem}>
                  <div style={styles.expenseContent}>
                    <div style={styles.expenseInfo}>
                      <h3 style={styles.expenseDesc}>{expense.description}</h3>
                      <p style={styles.expenseMeta}>
                        <span style={styles.expenseCategory}>{expense.category}</span>
                        <span style={styles.expenseDate}>
                          • {formatDate(expense.date)}
                        </span>
                      </p>
                    </div>
                    <div style={styles.expenseActions}>
                      <span style={styles.expenseAmount}>-${expense.amount.toFixed(2)}</span>
                      <button 
                        onClick={() => handleDelete(expense.id)}
                        style={styles.deleteButton}
                        title="Delete expense"
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
  summarySection: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '20px',
    marginTop: '20px',
  },
  '@media (max-width: 768px)': {
    summarySection: {
      gridTemplateColumns: '1fr',
    },
  },
  sectionTitle: {
    fontSize: '24px',
    marginBottom: '20px',
    color: '#212121',
  },
  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  countBadge: {
    backgroundColor: '#FF5722',
    color: 'white',
    padding: '5px 15px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  subTitle: {
    fontSize: '18px',
    marginBottom: '15px',
    color: '#666',
  },
  totalExpense: {
    fontSize: '20px',
    marginBottom: '30px',
    textAlign: 'center',
    padding: '15px',
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
    borderRadius: '8px',
  },
  totalAmount: {
    color: '#FF5722',
    fontWeight: 'bold',
    fontSize: '32px',
  },
  categorySummary: {
    marginTop: '20px',
  },
  categoryItem: {
    marginBottom: '15px',
  },
  categoryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '5px',
  },
  categoryName: {
    fontSize: '14px',
    color: '#333',
  },
  categoryAmount: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#FF5722',
  },
  categoryBarContainer: {
    height: '8px',
    backgroundColor: '#EEEEEE',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '5px',
  },
  categoryBar: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  categoryPercentage: {
    fontSize: '12px',
    color: '#666',
    textAlign: 'right',
    display: 'block',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '40px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #F5F5F5',
    borderTop: '4px solid #FF5722',
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
  expenseList: {
    maxHeight: '500px',
    overflowY: 'auto',
    paddingRight: '10px',
  },
  expenseItem: {
    padding: '15px',
    marginBottom: '10px',
    borderRadius: '8px',
    backgroundColor: 'white',
    border: '1px solid #EEEEEE',
    borderLeft: '4px solid #FF5722',
    transition: 'all 0.3s ease',
  },
  expenseContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDesc: {
    fontSize: '16px',
    color: '#212121',
    marginBottom: '5px',
  },
  expenseMeta: {
    fontSize: '14px',
    color: '#666',
  },
  expenseCategory: {
    backgroundColor: 'rgba(255, 87, 34, 0.2)',
    color: '#FF5722',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    marginRight: '8px',
    fontWeight: '500',
  },
  expenseDate: {
    fontSize: '13px',
    color: '#888',
  },
  expenseAmount: {
    fontSize: '18px',
    color: '#FF5722',
    fontWeight: 'bold',
    marginRight: '15px',
  },
  expenseActions: {
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

export default ExpenseManager;