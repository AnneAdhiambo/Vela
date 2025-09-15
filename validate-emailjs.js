// Simple validation script to check EmailJS configuration
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('🔍 Validating EmailJS Configuration...\n')

// Check if .env file exists
try {
  const envPath = join(__dirname, '.env')
  const envContent = readFileSync(envPath, 'utf8')
  
  console.log('✅ .env file found')
  
  // Check for required EmailJS variables
  const requiredVars = [
    'VITE_EMAILJS_SERVICE_ID',
    'VITE_EMAILJS_TEMPLATE_ID', 
    'VITE_EMAILJS_PUBLIC_KEY'
  ]
  
  const missingVars = []
  
  requiredVars.forEach(varName => {
    if (envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=your_`)) {
      console.log(`✅ ${varName} is configured`)
    } else {
      console.log(`❌ ${varName} is missing or not configured`)
      missingVars.push(varName)
    }
  })
  
  if (missingVars.length === 0) {
    console.log('\n🎉 All EmailJS variables are configured!')
    console.log('\n📋 Next steps:')
    console.log('1. Make sure you have set up the EmailJS service at https://emailjs.com')
    console.log('2. Create the email template with ID: template_vela_magic_link')
    console.log('3. Test the authentication by running: npm run dev && npm run build')
    console.log('4. Load the extension in Chrome and test with your email')
  } else {
    console.log('\n⚠️  Please configure the missing variables in your .env file')
    console.log('📖 See VELA_EMAIL_SETUP.md for detailed setup instructions')
  }
  
} catch (error) {
  console.log('❌ .env file not found')
  console.log('📋 Please copy .env.example to .env and configure your EmailJS credentials')
}

console.log('\n🔗 Helpful links:')
console.log('- EmailJS Dashboard: https://dashboard.emailjs.com/')
console.log('- Setup Guide: ./VELA_EMAIL_SETUP.md')
console.log('- Quick Setup: ./setup-emailjs.md')