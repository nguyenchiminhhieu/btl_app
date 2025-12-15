/**
 * Debug script to test Supabase connection and check database status
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://zxjlzjeqghqedfuzfvoq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4amx6amVxZ2hxZWRmdXpmdm9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5MjEzMzcsImV4cCI6MjA0OTQ5NzMzN30.Je2l62XShlu5Gb3egd2TsN-jrBIhaA8S3RGp2CDVS3k';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugSupabase() {
  console.log('🔍 Supabase Debug Information');
  console.log('============================');
  
  try {
    // Test 1: Basic connection
    console.log('\n1️⃣ Testing basic connection...');
    console.log('URL:', supabaseUrl);
    console.log('Key:', supabaseAnonKey.substring(0, 20) + '...');
    
    // Test 2: Check existing Part 1 tables (should work)
    console.log('\n2️⃣ Testing existing Part 1 tables...');
    
    try {
      const { data: part1Topics, error: part1Error } = await supabase
        .from('part1_topics')
        .select('id, topic_name')
        .limit(3);
      
      if (part1Error) {
        console.log('❌ Part 1 tables error:', part1Error.message);
      } else {
        console.log('✅ Part 1 tables working, found:', part1Topics?.length, 'topics');
        console.log('Sample:', part1Topics?.[0]?.topic_name);
      }
    } catch (err) {
      console.log('❌ Part 1 connection failed:', err.message);
    }
    
    // Test 3: Check Part 2 tables existence
    console.log('\n3️⃣ Testing Part 2 tables...');
    
    try {
      const { data: part2Topics, error: part2Error } = await supabase
        .from('part2_topics')
        .select('id, title')
        .limit(1);
      
      if (part2Error) {
        console.log('❌ part2_topics error:', part2Error.message);
        console.log('   Details:', JSON.stringify(part2Error, null, 2));
      } else {
        console.log('✅ part2_topics table exists, found:', part2Topics?.length, 'topics');
      }
    } catch (err) {
      console.log('❌ part2_topics connection failed:', err.message);
    }
    
    try {
      const { data: part2CueCards, error: cueError } = await supabase
        .from('part2_cue_cards')
        .select('id, main_prompt')
        .limit(1);
      
      if (cueError) {
        console.log('❌ part2_cue_cards error:', cueError.message);
      } else {
        console.log('✅ part2_cue_cards table exists, found:', part2CueCards?.length, 'cue cards');
      }
    } catch (err) {
      console.log('❌ part2_cue_cards connection failed:', err.message);
    }
    
    // Test 4: List all tables
    console.log('\n4️⃣ Listing all tables in database...');
    
    try {
      const { data: tables, error: tablesError } = await supabase.rpc('get_schema_tables');
      
      if (tablesError) {
        console.log('⚠️  Cannot list tables via RPC:', tablesError.message);
        
        // Alternative: Try to get tables via information_schema
        const { data: altTables, error: altError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public');
          
        if (altError) {
          console.log('⚠️  Cannot access information_schema:', altError.message);
        } else {
          console.log('📋 Found tables:', altTables?.map(t => t.table_name).join(', '));
        }
      } else {
        console.log('📋 Schema tables:', tables);
      }
    } catch (err) {
      console.log('⚠️  Error listing tables:', err.message);
    }
    
    // Test 5: Check authentication
    console.log('\n5️⃣ Checking authentication status...');
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('⚠️  Auth check failed:', authError.message);
    } else if (user) {
      console.log('👤 Authenticated user:', user.email);
    } else {
      console.log('👤 Anonymous user (using anon key)');
    }
    
    console.log('\n🎯 Summary and Next Steps:');
    console.log('==========================');
    console.log('If Part 1 tables work but Part 2 tables fail:');
    console.log('  → Part 2 tables have not been created yet');
    console.log('  → Go to Supabase Dashboard > SQL Editor');
    console.log('  → Run the SQL from SETUP_PART2_DATABASE.md');
    console.log('');
    console.log('If no tables work:'); 
    console.log('  → Check Supabase project URL and API key');
    console.log('  → Verify project is active and accessible');
    
  } catch (error) {
    console.error('💥 Debug failed:', error);
  }
}

// Run debug if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  debugSupabase();
}

export { debugSupabase };
