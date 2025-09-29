"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
async function testAmendmentAPI() {
    try {
        console.log('🧪 Testing Amendment API endpoints...');
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
        }
        else {
            const error = await createResponse.text();
            console.log('❌ Failed to create amendment request:', error);
        }
        console.log('\n📋 Test 2: Getting Amendment Requests...');
        const getResponse = await fetch('http://localhost:3001/corporates/amendment-requests?corporateId=16');
        if (getResponse.ok) {
            const amendmentRequests = await getResponse.json();
            console.log('✅ Amendment requests retrieved:', amendmentRequests);
            if (amendmentRequests.length > 0) {
                const amendmentId = amendmentRequests[0].id;
                console.log(`📝 Found amendment request with ID: ${amendmentId}`);
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
                }
                else {
                    const error = await approveResponse.text();
                    console.log('❌ Failed to approve amendment:', error);
                }
            }
        }
        else {
            const error = await getResponse.text();
            console.log('❌ Failed to get amendment requests:', error);
        }
        console.log('\n🎉 API testing completed!');
    }
    catch (error) {
        console.error('❌ API testing failed:', error);
    }
}
testAmendmentAPI().catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
});
//# sourceMappingURL=test_amendment_api.js.map