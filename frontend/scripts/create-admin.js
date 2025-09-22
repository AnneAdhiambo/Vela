#!/usr/bin/env node

// Admin user creation script
// Usage: node scripts/create-admin.js --email admin@example.com --password mypassword

const { createClient } = require('@supabase/supabase-js')
const readline = require('readline')

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Simple password hashing (in production, use bcrypt)
function hashPassword(password) {
  return Buffer.from(password + 'vela_salt_2024').toString('base64')
}

async function createAdminUser(email, password, role = 'admin') {
  try {
    console.log('🔧 Creating admin user...')
    console.log('Email:', email)
    console.log('Role:', role)
    
    const passwordHash = hashPassword(password)
    
    // First, create the admin_users table if it doesn't exist
    console.log('📋 Creating admin_users table...')
    
    const { data: tableData, error: tableError } = await supabase
      .from('admin_users')
      .select('*')
      .limit(1)
    
    if (tableError && tableError.code === 'PGRST116') {
      console.log('⚠️  admin_users table does not exist. Please create it first.')
      console.log('Run this SQL in your Supabase dashboard:')
      console.log(`
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow service role full access" ON admin_users
  FOR ALL USING (true);

CREATE POLICY "Allow authenticated users to read admin_users" ON admin_users
  FOR SELECT TO authenticated USING (true);
      `)
      return
    }
    
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', email)
      .single()
    
    if (existingUser) {
      console.log('❌ Admin user with this email already exists!')
      return
    }
    
    // Create the admin user
    const { data, error } = await supabase
      .from('admin_users')
      .insert([
        {
          email,
          password_hash: passwordHash,
          role,
          created_at: new Date().toISOString()
        }
      ])
      .select()
    
    if (error) {
      console.error('❌ Error creating admin user:', error)
      return
    }
    
    console.log('✅ Admin user created successfully!')
    console.log('User ID:', data[0].id)
    console.log('Email:', data[0].email)
    console.log('Role:', data[0].role)
    console.log('Created at:', data[0].created_at)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

async function listAdminUsers() {
  try {
    console.log('📋 Listing all admin users...')
    
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Error fetching admin users:', error)
      return
    }
    
    if (!data || data.length === 0) {
      console.log('📭 No admin users found.')
      return
    }
    
    console.log('👥 Admin users:')
    data.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.role}) - Created: ${new Date(user.created_at).toLocaleDateString()}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

async function deleteAdminUser(email) {
  try {
    console.log('🗑️  Deleting admin user...')
    console.log('Email:', email)
    
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('email', email)
    
    if (error) {
      console.error('❌ Error deleting admin user:', error)
      return
    }
    
    console.log('✅ Admin user deleted successfully!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

// Parse command line arguments
const args = process.argv.slice(2)
const command = args[0]

if (command === 'create') {
  const emailIndex = args.indexOf('--email')
  const passwordIndex = args.indexOf('--password')
  const roleIndex = args.indexOf('--role')
  
  if (emailIndex === -1 || passwordIndex === -1) {
    console.log('❌ Usage: node scripts/create-admin.js create --email admin@example.com --password mypassword [--role admin]')
    process.exit(1)
  }
  
  const email = args[emailIndex + 1]
  const password = args[passwordIndex + 1]
  const role = roleIndex !== -1 ? args[roleIndex + 1] : 'admin'
  
  if (!email || !password) {
    console.log('❌ Email and password are required!')
    process.exit(1)
  }
  
  createAdminUser(email, password, role)
} else if (command === 'list') {
  listAdminUsers()
} else if (command === 'delete') {
  const emailIndex = args.indexOf('--email')
  
  if (emailIndex === -1) {
    console.log('❌ Usage: node scripts/create-admin.js delete --email admin@example.com')
    process.exit(1)
  }
  
  const email = args[emailIndex + 1]
  
  if (!email) {
    console.log('❌ Email is required!')
    process.exit(1)
  }
  
  deleteAdminUser(email)
} else {
  console.log('🔧 Vela Admin User Management')
  console.log('')
  console.log('Commands:')
  console.log('  create --email <email> --password <password> [--role <role>]  Create admin user')
  console.log('  list                                                          List all admin users')
  console.log('  delete --email <email>                                        Delete admin user')
  console.log('')
  console.log('Examples:')
  console.log('  node scripts/create-admin.js create --email admin@vela.com --password mypassword123')
  console.log('  node scripts/create-admin.js create --email super@vela.com --password mypassword123 --role super_admin')
  console.log('  node scripts/create-admin.js list')
  console.log('  node scripts/create-admin.js delete --email admin@vela.com')
}
