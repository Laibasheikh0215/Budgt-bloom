import { createClient } from "@supabase/supabase-js";

// Your Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("🔍 Supabase Configuration:");
console.log("URL:", supabaseUrl);
console.log("Key available:", !!supabaseAnonKey);

// Check if credentials are loaded
if (!supabaseUrl) {
  console.error("❌ ERROR: VITE_SUPABASE_URL is not defined in .env file");
  console.error("Please check your .env file and restart the server");
}

if (!supabaseAnonKey) {
  console.error("❌ ERROR: VITE_SUPABASE_ANON_KEY is not defined in .env file");
  console.error("Please check your .env file and restart the server");
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Test connection function
export const testConnection = async () => {
  try {
    console.log("🔄 Testing Supabase connection...");
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("❌ Supabase connection failed:", error.message);
      return { success: false, error: error.message };
    }
    
    console.log("✅ Supabase connected successfully!");
    console.log("Session:", data.session ? "Active" : "No session");
    return { success: true, session: data.session };
  } catch (err) {
    console.error("❌ Connection test error:", err);
    return { success: false, error: err.message };
  }
};

// Database operations
export const database = {
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      console.log("No user logged in");
      return null;
    }
    return user;
  },

  // INCOME OPERATIONS
  async getIncomes() {
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
  },

  async addIncome(incomeData) {
    const user = await this.getCurrentUser();
    if (!user) {
      alert("Please login first!");
      return null;
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
      alert(`Error: ${error.message}`);
      return null;
    }
    
    console.log("Income added successfully:", data);
    return data;
  },

  async deleteIncome(id) {
    const { error } = await supabase
      .from("income")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting income:", error);
      alert(`Error: ${error.message}`);
      return false;
    }
    
    console.log(`Income ${id} deleted successfully`);
    return true;
  },

  // EXPENSE OPERATIONS
  async getExpenses() {
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
  },

  async addExpense(expenseData) {
    const user = await this.getCurrentUser();
    if (!user) {
      alert("Please login first!");
      return null;
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
      alert(`Error: ${error.message}`);
      return null;
    }
    
    console.log("Expense added successfully:", data);
    return data;
  },

  async deleteExpense(id) {
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting expense:", error);
      alert(`Error: ${error.message}`);
      return false;
    }
    
    console.log(`Expense ${id} deleted successfully`);
    return true;
  },

  // BUDGET OPERATIONS
  async getBudgets() {
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
  },

  async addBudget(budgetData) {
    const user = await this.getCurrentUser();
    if (!user) {
      alert("Please login first!");
      return null;
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
      alert(`Error: ${error.message}`);
      return null;
    }
    
    console.log("Budget added successfully:", data);
    return data;
  },

  async deleteBudget(id) {
    const { error } = await supabase
      .from("budgets")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting budget:", error);
      alert(`Error: ${error.message}`);
      return false;
    }
    
    console.log(`Budget ${id} deleted successfully`);
    return true;
  },

  // DASHBOARD FUNCTIONS
  async getDashboardTotals() {
    const incomes = await this.getIncomes();
    const expenses = await this.getExpenses();

    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const balance = totalIncome - totalExpenses;

    console.log("Dashboard totals:", { totalIncome, totalExpenses, balance });
    
    return { totalIncome, totalExpenses, balance };
  },

  async getRecentTransactions(limit = 5) {
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
  },
};