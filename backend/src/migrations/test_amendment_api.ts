import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function testAmendmentAPI() {
  try {
    console.log('🧪 Testing Amendment API endpoints...');
    
    // Test data
    const testAmendmentData = {
      requestedChanges: 'Change company name from Test Company to New Test Company',
      amendmentReason: 'Company rebranding and business expansion',
      submittedBy: 'test@example.com',
      originalData: {
        company_name: 'Test Company',
        reg_number: '123456-A',
        credit_limit: '50000'
      },
      amendedData: {
        company_name: 'New Test Company',
        reg_number: '123456-A',
        credit_limit: '100000'
      }
    };

    // Test 1: Create Amendment Request
    console.log('\n📝 Test 1: Creating Amendment Request...');
    const createResponse = await fetch('http://localhost:3001/corporates/16/amendment-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testAmendmentData)
    });

    if (createResponse.ok) {
      const createResult = await createResponse.json();
      console.log('✅ Amendment request created successfully:', createResult);
    } else {
      const error = await createResponse.text();
      console.log('❌ Failed to create amendment request:', error);
    }

    // Test 2: Get Amendment Requests
    console.log('\n📋 Test 2: Getting Amendment Requests...');
    const getResponse = await fetch('http://localhost:3001/corporates/amendment-requests?corporateId=16');
    
    if (getResponse.ok) {
      const amendmentRequests = await getResponse.json();
      console.log('✅ Amendment requests retrieved:', amendmentRequests);
      
      if (amendmentRequests.length > 0) {
        const amendmentId = amendmentRequests[0].id;
        console.log(`📝 Found amendment request with ID: ${amendmentId}`);
        
        // Test 3: Update Amendment Status (Approve)
        console.log('\n✅ Test 3: Approving Amendment Request...');
        const approveResponse = await fetch(`http://localhost:3001/corporates/16/amendment-requests/${amendmentId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'approved',
            reviewNotes: 'All changes verified and approved by CRT team'
          })
        });

        if (approveResponse.ok) {
          const approveResult = await approveResponse.json();
          console.log('✅ Amendment approved successfully:', approveResult);
        } else {
          const error = await approveResponse.text();
          console.log('❌ Failed to approve amendment:', error);
        }
      }
    } else {
      const error = await getResponse.text();
      console.log('❌ Failed to get amendment requests:', error);
    }

    console.log('\n🎉 API testing completed!');
    
  } catch (error) {
    console.error('❌ API testing failed:', error);
  }
}

testAmendmentAPI().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});

