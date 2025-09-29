import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function testAPISimple() {
  try {
    console.log('🧪 Testing API endpoints with simple requests...');
    
    // Test 1: Basic corporate endpoint
    console.log('\n📝 Test 1: Basic corporate endpoint...');
    const corporateResponse = await fetch('http://localhost:3001/corporates/16');
    if (corporateResponse.ok) {
      console.log('✅ Corporate endpoint works');
    } else {
      console.log('❌ Corporate endpoint failed:', corporateResponse.status);
    }
    
    // Test 2: Amendment requests endpoint without query
    console.log('\n📝 Test 2: Amendment requests endpoint without query...');
    try {
      const amendmentResponse = await fetch('http://localhost:3001/corporates/amendment-requests');
      console.log('Response status:', amendmentResponse.status);
      console.log('Response headers:', Object.fromEntries(amendmentResponse.headers.entries()));
      
      if (amendmentResponse.ok) {
        const data = await amendmentResponse.json();
        console.log('✅ Amendment requests endpoint works:', data);
      } else {
        const errorText = await amendmentResponse.text();
        console.log('❌ Amendment requests endpoint failed:', errorText);
      }
    } catch (error) {
      console.log('❌ Amendment requests endpoint error:', error.message);
    }
    
    // Test 3: Amendment requests endpoint with query
    console.log('\n📝 Test 3: Amendment requests endpoint with query...');
    try {
      const amendmentResponseWithQuery = await fetch('http://localhost:3001/corporates/amendment-requests?corporateId=16');
      console.log('Response status:', amendmentResponseWithQuery.status);
      
      if (amendmentResponseWithQuery.ok) {
        const data = await amendmentResponseWithQuery.json();
        console.log('✅ Amendment requests endpoint with query works:', data);
      } else {
        const errorText = await amendmentResponseWithQuery.text();
        console.log('❌ Amendment requests endpoint with query failed:', errorText);
      }
    } catch (error) {
      console.log('❌ Amendment requests endpoint with query error:', error.message);
    }
    
    console.log('\n🎉 API testing completed!');
    
  } catch (error) {
    console.error('❌ API testing failed:', error);
  }
}

testAPISimple().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});


