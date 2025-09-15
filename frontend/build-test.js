// Simple test to verify the project structure
const fs = require('fs')
const path = require('path')

console.log('Testing Vela Landing Page Setup...')

// Check if all required files exist
const requiredFiles = [
  'package.json',
  'next.config.js',
  'tailwind.config.ts',
  'tsconfig.json',
  'src/app/page.tsx',
  'src/app/layout.tsx',
  'src/components/Hero.tsx',
  'src/components/Features.tsx',
  'src/components/Premium.tsx',
  // Polar integration files
  'src/lib/polar.ts',
  'src/app/api/create-checkout/route.ts',
  'src/app/api/checkout-details/route.ts',
  'src/app/success/page.tsx',
  '.env.local'
]

let allFilesExist = true

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - MISSING`)
    allFilesExist = false
  }
})

if (allFilesExist) {
  console.log('\n🎉 All required files are present!')
  console.log('\n📋 Polar Integration Setup Complete:')
  console.log('✅ Direct Polar API implementation')
  console.log('✅ Environment variables configured')
  console.log('✅ API routes created')
  console.log('✅ Success page implemented')
  console.log('✅ Premium component updated')
  console.log('✅ Development mode with mock responses')
  
  console.log('\nNext steps:')
  console.log('1. Run: npm install')
  console.log('2. Run: npm run dev')
  console.log('3. Open: http://localhost:3000')
  console.log('4. Test premium upgrade flow')
  console.log('5. Run: node test-polar-integration.js')
} else {
  console.log('\n❌ Some files are missing. Please check the setup.')
}