import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { database, supabase } from '../lib/supabase';

const Dashboard = () => {
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [balance, setBalance] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        console.log('Current user:', user);
        
        if (user) {
          // Set current month
          const now = new Date();
          const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
          setCurrentMonth(`${monthNames[now.getMonth()]} ${now.getFullYear()}`);
          
          // Get dashboard data
          const totals = await database.getDashboardTotals();
          console.log('Dashboard totals:', totals);
          setTotalIncome(totals.totalIncome);
          setTotalExpenses(totals.totalExpenses);
          setBalance(totals.balance);
          
          // Get recent transactions
          const transactions = await database.getRecentTransactions(5);
          console.log('Recent transactions:', transactions);
          setRecentTransactions(transactions);
        } else {
          console.log('No user found');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const addSampleData = async () => {
    if (!window.confirm('Add sample income and expense data for testing?')) return;
    
    setLoading(true);
    try {
      // Add sample income
      const sampleIncome = {
        source: 'Salary',
        amount: 5000,
        date: new Date().toISOString().split('T')[0]
      };
      await database.addIncome(sampleIncome);
      
      // Add sample expenses
      const sampleExpenses = [
        { category: 'Food & Dining', description: 'Grocery Shopping', amount: 300, date: new Date().toISOString().split('T')[0] },
        { category: 'Utilities', description: 'Electricity Bill', amount: 150, date: new Date().toISOString().split('T')[0] },
        { category: 'Transportation', description: 'Fuel', amount: 100, date: new Date().toISOString().split('T')[0] }
      ];
      
      for (const expense of sampleExpenses) {
        await database.addExpense(expense);
      }
      
      alert('Sample data added successfully! Refreshing...');
      window.location.reload();
    } catch (error) {
      console.error('Error adding sample data:', error);
      alert('Error adding sample data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <div style={styles.spinner}></div>
        <p>Loading your financial data...</p>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
          {user ? `Logged in as: ${user.email}` : 'Not logged in'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Dashboard Overview</h1>
        <p style={styles.subtitle}>Track your finances for {currentMonth}</p>
        <p style={styles.userInfo}>
          Logged in as: <strong>{user?.email || 'Unknown'}</strong>
        </p>
      </div>

      <div style={styles.actions}>
        <button 
          onClick={addSampleData}
          className="btn btn-info"
          style={styles.sampleButton}
          disabled={loading}
        >
          Add Sample Data
        </button>
      </div>

      <div style={styles.statsGrid}>
        <div className="card" style={styles.statCard}>
          <div style={styles.statIcon}>💰</div>
          <h3 style={styles.statTitle}>Total Income</h3>
          <p style={{ ...styles.statAmount, color: '#4CAF50' }}>
            ${totalIncome.toFixed(2)}
          </p>
          <Link to="/income" style={styles.viewLink}>View Details →</Link>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={styles.statIcon}>💸</div>
          <h3 style={styles.statTitle}>Total Expenses</h3>
          <p style={{ ...styles.statAmount, color: '#FF5722' }}>
            ${totalExpenses.toFixed(2)}
          </p>
          <Link to="/expenses" style={styles.viewLink}>View Details →</Link>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={styles.statIcon}>⚖️</div>
          <h3 style={styles.statTitle}>Current Balance</h3>
          <p style={{ 
            ...styles.statAmount, 
            color: balance >= 0 ? '#4CAF50' : '#FF5722' 
          }}>
            ${balance.toFixed(2)}
          </p>
          <div style={styles.savingsInfo}>
            {balance >= 0 ? (
              <span style={styles.savingsPositive}>
                Available: ${balance.toFixed(2)}
              </span>
            ) : (
              <span style={styles.savingsNegative}>
                Deficit: ${Math.abs(balance).toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Recent Transactions</h2>
          <span style={styles.countBadge}>
            {recentTransactions.length} transactions
          </span>
        </div>
        
        {recentTransactions.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyIcon}>📊</p>
            <p>No transactions yet</p>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
              Start by adding your first income or expense
            </p>
            <button 
              onClick={addSampleData}
              className="btn btn-primary"
              style={{ marginTop: '15px' }}
            >
              Add Sample Data
            </button>
          </div>
        ) : (
          <>
            <div style={styles.transactionsList}>
              {recentTransactions.map((transaction, index) => (
                <div 
                  key={transaction.id || index} 
                  style={transaction.type === 'income' ? styles.incomeItem : styles.expenseItem}
                >
                  <div style={styles.transactionInfo}>
                    <div style={styles.transactionIcon}>
                      {transaction.type === 'income' ? '⬇️' : '⬆️'}
                    </div>
                    <div style={styles.transactionDetails}>
                      <strong>
                        {transaction.type === 'income' 
                          ? transaction.source 
                          : transaction.description}
                      </strong>
                      <p style={styles.transactionMeta}>
                        {formatDate(transaction.date)} • 
                        {transaction.type === 'income' 
                          ? ' Income' 
                          : ` ${transaction.category}`}
                      </p>
                    </div>
                    <span style={transaction.type === 'income' ? styles.amountPositive : styles.amountNegative}>
                      {transaction.type === 'income' ? '+ ' : '- '}${transaction.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={styles.summaryNote}>
              <p>
                <strong>Calculation:</strong> 
                Balance = Total Income (${totalIncome.toFixed(2)}) - Total Expenses (${totalExpenses.toFixed(2)})
              </p>
              <p style={{ marginTop: '5px', fontSize: '13px' }}>
                Total Records: {recentTransactions.length} | 
                Income: ${totalIncome.toFixed(2)} | 
                Expenses: ${totalExpenses.toFixed(2)}
              </p>
            </div>
          </>
        )}
        
        <div style={styles.actions}>
          <Link to="/income" className="btn btn-success" style={styles.actionButton}>
            <span style={{ marginRight: '5px' }}>+</span> Add Income
          </Link>
          <Link to="/expenses" className="btn btn-danger" style={styles.actionButton}>
            <span style={{ marginRight: '5px' }}>-</span> Add Expense
          </Link>
          <Link to="/budgets" className="btn btn-primary" style={styles.actionButton}>
            📋 Manage Budgets
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  header: {
    marginBottom: '30px',
  },
  title: {
    fontSize: '32px',
    color: '#212121',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '5px',
  },
  userInfo: {
    fontSize: '14px',
    color: '#888',
  },
  actions: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  sampleButton: {
    backgroundColor: '#06b6d4',
    borderColor: '#06b6d4',
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    textAlign: 'center',
    padding: '25px 20px',
    position: 'relative',
    transition: 'all 0.3s ease',
  },
  statIcon: {
    fontSize: '36px',
    marginBottom: '15px',
  },
  statTitle: {
    fontSize: '18px',
    color: '#666',
    marginBottom: '10px',
  },
  statAmount: {
    fontSize: '36px',
    fontWeight: 'bold',
    marginBottom: '15px',
  },
  viewLink: {
    color: '#2196F3',
    textDecoration: 'none',
    fontSize: '14px',
    display: 'inline-block',
    marginTop: '10px',
  },
  savingsInfo: {
    marginTop: '10px',
    fontSize: '14px',
  },
  savingsPositive: {
    color: '#4CAF50',
    fontWeight: 'bold',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: '5px 10px',
    borderRadius: '4px',
    display: 'inline-block',
  },
  savingsNegative: {
    color: '#FF5722',
    fontWeight: 'bold',
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
    padding: '5px 10px',
    borderRadius: '4px',
    display: 'inline-block',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '24px',
    color: '#212121',
  },
  countBadge: {
    backgroundColor: '#6366f1',
    color: 'white',
    padding: '5px 15px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '15px',
  },
  transactionsList: {
    marginBottom: '20px',
  },
  incomeItem: {
    padding: '15px',
    marginBottom: '10px',
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    borderLeft: '4px solid #4CAF50',
    borderRadius: '4px',
  },
  expenseItem: {
    padding: '15px',
    marginBottom: '10px',
    backgroundColor: 'rgba(255, 87, 34, 0.05)',
    borderLeft: '4px solid #FF5722',
    borderRadius: '4px',
  },
  transactionInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  transactionIcon: {
    fontSize: '20px',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionMeta: {
    fontSize: '14px',
    color: '#666',
    marginTop: '5px',
  },
  amountPositive: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: '18px',
    minWidth: '100px',
    textAlign: 'right',
  },
  amountNegative: {
    color: '#FF5722',
    fontWeight: 'bold',
    fontSize: '18px',
    minWidth: '100px',
    textAlign: 'right',
  },
  summaryNote: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  actionButton: {
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 20px',
  },
};

// Add animation to global CSS
const styleSheet = document.styleSheets[0];
if (styleSheet) {
  styleSheet.insertRule(`
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `, styleSheet.cssRules.length);
}

export default Dashboard;