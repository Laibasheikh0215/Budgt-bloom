import { supabase, database } from './lib/supabase';

async function testAll() {
  console.log('🚀 Testing Supabase Connection...');
  
  // 1. Test basic connection
  const { data: testData, error: testError } = await supabase
    .from('income')
    .select('*')
    .limit(1);
  
  if (testError) {
    console.error('❌ Connection failed:', testError);
    return;
  }
  
  console.log('✅ Connection successful!');
  
  // 2. Test adding income
  console.log('\n💰 Testing income addition...');
  const newIncome = await database.addIncome({
    source: 'Test Salary',
    amount: 1000,
    date: new Date().toISOString().split('T')[0]
  });
  
  if (newIncome) {
    console.log('✅ Income added:', newIncome);
  } else {
    console.log('❌ Failed to add income');
  }
  
  // 3. Test fetching incomes
  console.log('\n📊 Testing income fetch...');
  const incomes = await database.getIncomes();
  console.log('✅ Incomes fetched:', incomes.length, 'items');
  
  // 4. Test totals
  console.log('\n🧮 Testing totals...');
  const totals = await database.getDashboardTotals();
  console.log('✅ Totals:', totals);
}

// Run test
testAll();