/**
 * Database Migration Runner for Part 2
 * This script runs the SQL migration to create Part 2 tables in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Initialize Supabase client
const supabaseUrl = 'https://zxjlzjeqghqedfuzfvoq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4amx6amVxZ2hxZWRmdXpmdm9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5MjEzMzcsImV4cCI6MjA0OTQ5NzMzN30.Je2l62XShlu5Gb3egd2TsN-jrBIhaA8S3RGp2CDVS3k';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runMigration() {
  try {
    console.log('🛠️  Running Part 2 database migration...');
    
    // Read SQL file
    const sqlPath = path.join(process.cwd(), 'scripts', 'part2-migration.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL commands (basic split by semicolon)
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Executing ${commands.length} SQL commands...`);
    
    // Execute each command
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.length === 0) continue;
      
      console.log(`⚡ Executing command ${i + 1}/${commands.length}`);
      
      const { error } = await supabase.rpc('exec_sql', { 
        sql_query: command + ';'
      });
      
      if (error) {
        console.error(`❌ Error in command ${i + 1}:`, error);
        console.log(`Command was: ${command}`);
        // Continue with other commands
      } else {
        console.log(`✅ Command ${i + 1} executed successfully`);
      }
    }
    
    console.log('🎉 Migration completed!');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Alternative: Manual table creation using Supabase client
async function createTablesManually() {
  try {
    console.log('🛠️  Creating Part 2 tables manually...');
    
    // Check if tables exist first
    const { data: existingTables, error: checkError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['part2_topics', 'part2_cue_cards']);
    
    if (checkError) {
      console.log('ℹ️  Cannot check existing tables, proceeding with creation...');
    } else {
      console.log(`📋 Found ${existingTables?.length || 0} existing Part 2 tables`);
    }
    
    // Create part2_topics table using SQL
    const createTopicsSQL = `
      CREATE TABLE IF NOT EXISTS part2_topics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(200) NOT NULL,
        description TEXT,
        difficulty_level VARCHAR(20) DEFAULT 'intermediate',
        category VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    const { error: topicsError } = await supabase.rpc('exec_sql', { 
      sql_query: createTopicsSQL
    });
    
    if (topicsError) {
      console.error('❌ Error creating part2_topics:', topicsError);
    } else {
      console.log('✅ part2_topics table created/verified');
    }
    
    // Create part2_cue_cards table
    const createCueCardsSQL = `
      CREATE TABLE IF NOT EXISTS part2_cue_cards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        topic_id UUID REFERENCES part2_topics(id) ON DELETE CASCADE,
        main_prompt TEXT NOT NULL,
        bullet_points TEXT[] NOT NULL,
        follow_up_question TEXT NOT NULL,
        preparation_time INTEGER DEFAULT 60,
        speaking_time_min INTEGER DEFAULT 60,
        speaking_time_max INTEGER DEFAULT 120,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    const { error: cueCardsError } = await supabase.rpc('exec_sql', { 
      sql_query: createCueCardsSQL
    });
    
    if (cueCardsError) {
      console.error('❌ Error creating part2_cue_cards:', cueCardsError);
    } else {
      console.log('✅ part2_cue_cards table created/verified');
    }
    
    console.log('🎉 Manual table creation completed!');
    
  } catch (error) {
    console.error('💥 Manual table creation failed:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Try manual approach first (more reliable)
  createTablesManually().catch(() => {
    console.log('🔄 Falling back to SQL migration...');
    runMigration();
  });
}

export { createTablesManually, runMigration };
