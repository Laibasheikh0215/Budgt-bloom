import { createClient } from "@supabase/supabase-js";

// Your Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("🔍 Supabase Configuration:");
console.log("URL:", supabaseUrl);
console.log("Key available:", !!supabaseAnonKey);

// Check if credentials are loaded
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ ERROR: Supabase credentials are missing!");
  console.error("Please create a .env file with:");
  console.error("VITE_SUPABASE_URL=your_url");
  console.error("VITE_SUPABASE_ANON_KEY=your_key");
}

// Create Supabase client with better configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage
  },
  global: {
    fetch: (...args) => {
      console.log('Fetching:', args[0]);
      return fetch(...args);
    }
  }
});

// Test connection function with better error handling
export const testConnection = async () => {
  try {
    console.log("🔄 Testing Supabase connection...");
    
    // Try a simple query to test connection
    const { data, error } = await supabase.from('income').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error("❌ Supabase connection failed:", error);
      
      // Check for common issues
      if (error.message.includes('Failed to fetch')) {
        console.error("Possible issues:");
        console.error("1. Check if Supabase URL is correct");
        console.error("2. Check if you're connected to the internet");
        console.error("3. Check if Supabase project is active");
        console.error("4. Check CORS settings in Supabase");
        return { 
          success: false, 
          error: "Cannot connect to Supabase. Please check your internet connection and Supabase configuration." 
        };
      }
      
      return { success: false, error: error.message };
    }
    
    console.log("✅ Supabase connected successfully!");
    return { success: true };
  } catch (err) {
    console.error("❌ Connection test error:", err);
    return { success: false, error: err.message };
  }
};

// Database operations
export const database = {
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        console.log("No user logged in");
        return null;
      }
      return user;
    } catch (err) {
      console.error("Error getting current user:", err);
      return null;
    }
  },

  // INCOME OPERATIONS
  async getIncomes() {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        console.log("Cannot fetch incomes: No user");
        return [];
      }

      const { data, error } = await supabase
        .from("income")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching incomes:", error);
        return [];
      }
      
      console.log(`Fetched ${data?.length || 0} incomes`);
      return data || [];
    } catch (err) {
      console.error("Error in getIncomes:", err);
      return [];
    }
  },

  async addIncome(incomeData) {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        throw new Error("Please login first!");
      }

      const dataToInsert = {
        ...incomeData,
        user_id: user.id,
        created_at: new Date().toISOString(),
      };

      console.log("Inserting income:", dataToInsert);

      const { data, error } = await supabase
        .from("income")
        .insert([dataToInsert])
        .select()
        .single();

      if (error) {
        console.error("Error adding income:", error);
        throw new Error(error.message);
      }
      
      console.log("Income added successfully:", data);
      return data;
    } catch (err) {
      console.error("Error in addIncome:", err);
      throw err;
    }
  },

  async deleteIncome(id) {
    try {
      const { error } = await supabase
        .from("income")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting income:", error);
        throw new Error(error.message);
      }
      
      console.log(`Income ${id} deleted successfully`);
      return true;
    } catch (err) {
      console.error("Error in deleteIncome:", err);
      throw err;
    }
  },

  // EXPENSE OPERATIONS
  async getExpenses() {
    try {
      const user = await this.getCurrentUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching expenses:", error);
        return [];
      }
      
      console.log(`Fetched ${data?.length || 0} expenses`);
      return data || [];
    } catch (err) {
      console.error("Error in getExpenses:", err);
      return [];
    }
  },

  async addExpense(expenseData) {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        throw new Error("Please login first!");
      }

      const dataToInsert = {
        ...expenseData,
        user_id: user.id,
        created_at: new Date().toISOString(),
      };

      console.log("Inserting expense:", dataToInsert);

      const { data, error } = await supabase
        .from("expenses")
        .insert([dataToInsert])
        .select()
        .single();

      if (error) {
        console.error("Error adding expense:", error);
        throw new Error(error.message);
      }
      
      console.log("Expense added successfully:", data);
      return data;
    } catch (err) {
      console.error("Error in addExpense:", err);
      throw err;
    }
  },

  async deleteExpense(id) {
    try {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting expense:", error);
        throw new Error(error.message);
      }
      
      console.log(`Expense ${id} deleted successfully`);
      return true;
    } catch (err) {
      console.error("Error in deleteExpense:", err);
      throw err;
    }
  },

  // BUDGET OPERATIONS
  async getBudgets() {
    try {
      const user = await this.getCurrentUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching budgets:", error);
        return [];
      }
      
      console.log(`Fetched ${data?.length || 0} budgets`);
      return data || [];
    } catch (err) {
      console.error("Error in getBudgets:", err);
      return [];
    }
  },

  async addBudget(budgetData) {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        throw new Error("Please login first!");
      }

      const dataToInsert = {
        ...budgetData,
        user_id: user.id,
        created_at: new Date().toISOString(),
      };

      console.log("Inserting budget:", dataToInsert);

      const { data, error } = await supabase
        .from("budgets")
        .insert([dataToInsert])
        .select()
        .single();

      if (error) {
        console.error("Error adding budget:", error);
        throw new Error(error.message);
      }
      
      console.log("Budget added successfully:", data);
      return data;
    } catch (err) {
      console.error("Error in addBudget:", err);
      throw err;
    }
  },

  async deleteBudget(id) {
    try {
      const { error } = await supabase
        .from("budgets")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting budget:", error);
        throw new Error(error.message);
      }
      
      console.log(`Budget ${id} deleted successfully`);
      return true;
    } catch (err) {
      console.error("Error in deleteBudget:", err);
      throw err;
    }
  },

  // DASHBOARD FUNCTIONS
  async getDashboardTotals() {
    try {
      const incomes = await this.getIncomes();
      const expenses = await this.getExpenses();

      const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
      const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
      const balance = totalIncome - totalExpenses;

      console.log("Dashboard totals:", { totalIncome, totalExpenses, balance });
      
      return { totalIncome, totalExpenses, balance };
    } catch (err) {
      console.error("Error in getDashboardTotals:", err);
      return { totalIncome: 0, totalExpenses: 0, balance: 0 };
    }
  },

  async getRecentTransactions(limit = 5) {
    try {
      const incomes = await this.getIncomes();
      const expenses = await this.getExpenses();

      const allTransactions = [
        ...incomes.map((item) => ({ 
          ...item, 
          type: "income",
          title: item.source 
        })),
        ...expenses.map((item) => ({ 
          ...item, 
          type: "expense",
          title: item.description 
        })),
      ];

      return allTransactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);
    } catch (err) {
      console.error("Error in getRecentTransactions:", err);
      return [];
    }
  },
};