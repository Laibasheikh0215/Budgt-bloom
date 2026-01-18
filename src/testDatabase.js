import { supabase, database } from './lib/supabase';

async function testDatabase() {
  console.log('🧪 Testing Database Connection...');
  
  try {
    // 1. Test authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Auth error:', authError);
    } else if (!user) {
      console.log('ℹ️ No user logged in. Please login first.');
    } else {
      console.log('✅ User logged in:', user.email);
      console.log('User ID (UUID):', user.id);
      console.log('User ID type:', typeof user.id);
    }
    
    // 2. Test table structure
    console.log('\n📊 Testing table structure...');
    
    const tables = ['income', 'expenses', 'budgets'];
    for (const table of tables) {
      const { data: columns, error: columnError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', table)
        .order('ordinal_position');
      
      if (columnError) {
        console.error(`❌ Error getting ${table} columns:`, columnError);
      } else {
        console.log(`\n${table} table structure:`);
        columns.forEach(col => {
          console.log(`  ${col.column_name}: ${col.data_type}`);
        });
      }
    }
    
    // 3. Test insert if user is logged in
    if (user) {
      console.log('\n💾 Testing data insertion...');
      
      const testIncome = {
        source: 'Test Salary',
        amount: 1000,
        date: new Date().toISOString().split('T')[0]
      };
      
      const inserted = await database.addIncome(testIncome);
      if (inserted) {
        console.log('✅ Insert successful:', inserted);
        
        // 4. Test fetch
        const incomes = await database.getIncomes();
        console.log(`✅ Fetched ${incomes.length} incomes`);
        
        // 5. Test delete
        const deleted = await database.deleteIncome(inserted.id);
        if (deleted) {
          console.log('✅ Delete successful');
        }
      }
    }
    
    console.log('\n🎉 Database test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run test
testDatabase();