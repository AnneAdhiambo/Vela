// Test script for magic link authentication flow
const fetch = require('node-fetch');

const BASE_URL = 'http://127.0.0.1:3001';

async function testMagicLinkFlow() {
  console.log('🧪 Testing Magic Link Authentication Flow\n');

  try {
    // Test 1: Generate magic link
    console.log('1️⃣ Testing magic link generation...');
    const magicLinkResponse = await fetch(`${BASE_URL}/api/auth/magic-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'test@example.com' })
    });

    const magicLinkData = await magicLinkResponse.json();
    
    if (magicLinkData.success) {
      console.log('✅ Magic link generated successfully');
      console.log(`   Token: ${magicLinkData.token.substring(0, 8)}...`);
      console.log(`   Magic Link: ${magicLinkData.magicLink}`);
      console.log(`   Expires: ${new Date(magicLinkData.expiresAt).toLocaleString()}\n`);

      // Test 2: Check token status
      console.log('2️⃣ Testing token status check...');
      const statusResponse = await fetch(`${BASE_URL}/api/auth/wait/${magicLinkData.token}`);
      const statusData = await statusResponse.json();
      
      if (statusData.success) {
        console.log('✅ Token status check successful');
        console.log(`   Status: ${statusData.status}`);
        console.log(`   Email: ${statusData.email}\n`);
      } else {
        console.log('❌ Token status check failed:', statusData.error);
      }

      // Test 3: Simulate magic link click (verify endpoint)
      console.log('3️⃣ Testing magic link verification...');
      const verifyResponse = await fetch(`${BASE_URL}/api/auth/verify?token=${magicLinkData.token}`);
      
      if (verifyResponse.status === 302) {
        console.log('✅ Magic link verification successful (redirected)');
        const location = verifyResponse.headers.get('location');
        console.log(`   Redirected to: ${location}\n`);
        
        // Extract auth token from redirect URL
        const url = new URL(location);
        const authToken = url.searchParams.get('token');
        
        if (authToken) {
          // Test 4: Verify auth token
          console.log('4️⃣ Testing auth token verification...');
          const authResponse = await fetch(`${BASE_URL}/api/auth/verify-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: authToken })
          });
          
          const authData = await authResponse.json();
          
          if (authData.success) {
            console.log('✅ Auth token verification successful');
            console.log(`   User ID: ${authData.user.id}`);
            console.log(`   Email: ${authData.user.email}`);
            console.log(`   Display Name: ${authData.user.displayName}\n`);
          } else {
            console.log('❌ Auth token verification failed:', authData.error);
          }
        }
      } else {
        console.log('❌ Magic link verification failed');
        const errorData = await verifyResponse.text();
        console.log(`   Error: ${errorData}\n`);
      }

    } else {
      console.log('❌ Magic link generation failed:', magicLinkData.error);
    }

    // Test 5: Health check
    console.log('5️⃣ Testing health check...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    
    if (healthData.status === 'OK') {
      console.log('✅ Health check successful');
      console.log(`   Pending tokens: ${healthData.pendingTokens}`);
      console.log(`   Authenticated users: ${healthData.authenticatedUsers}`);
    } else {
      console.log('❌ Health check failed');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testMagicLinkFlow();

