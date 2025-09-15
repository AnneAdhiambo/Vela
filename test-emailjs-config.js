// Simple test to verify EmailJS configuration
// Run this with: node test-emailjs-config.js

import { readFileSync } from 'fs'

console.log('🧪 Testing EmailJS Configuration...\n')

try {
  // Read .env file
  const envContent = readFileSync('.env', 'utf8')
  
  // Extract EmailJS variables
  const getEnvVar = (name) => {
    const match = envContent.match(new RegExp(`${name}=(.+)`))
    return match ? match[1].trim() : null
  }
  
  const serviceId = getEnvVar('VITE_EMAILJS_SERVICE_ID')
  const templateId = getEnvVar('VITE_EMAILJS_TEMPLATE_ID')
  const publicKey = getEnvVar('VITE_EMAILJS_PUBLIC_KEY')
  
  console.log('📋 Configuration Check:')
  console.log(`Service ID: ${serviceId || '❌ Missing'}`)
  console.log(`Template ID: ${templateId || '❌ Missing'}`)
  console.log(`Public Key: ${publicKey ? '✅ Set' : '❌ Missing'}`)
  
  // Check if all required variables are set
  if (!serviceId || serviceId.includes('your_')) {
    console.log('\n❌ VITE_EMAILJS_SERVICE_ID is not configured')
    console.log('   Expected: service_vela_mail')
  }
  
  if (!templateId || templateId.includes('your_')) {
    console.log('\n❌ VITE_EMAILJS_TEMPLATE_ID is not configured')
    console.log('   Expected: template_vela_magic_link')
  }
  
  if (!publicKey || publicKey.includes('your_')) {
    console.log('\n❌ VITE_EMAILJS_PUBLIC_KEY is not configured')
    console.log('   Get this from: https://dashboard.emailjs.com/admin/account')
  }
  
  if (serviceId && templateId && publicKey && 
      !serviceId.includes('your_') && 
      !templateId.includes('your_') && 
      !publicKey.includes('your_')) {
    console.log('\n✅ All EmailJS variables are configured!')
    console.log('\n📋 Next steps:')
    console.log('1. Make sure your EmailJS service is set up with Vela email server')
    console.log('2. Create the email template with the correct variables')
    console.log('3. Test by running the extension and trying to sign in')
  } else {
    console.log('\n⚠️  Please complete the EmailJS configuration')
    console.log('📖 See VELA_EMAIL_SETUP.md for detailed instructions')
  }
  
  console.log('\n🔗 EmailJS Dashboard: https://dashboard.emailjs.com/')
  
} catch (error) {
  console.log('❌ Error reading .env file:', error.message)
  console.log('📋 Make sure .env file exists and is properly formatted')
}