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
async function testAPISimple() {
    try {
        console.log('🧪 Testing API endpoints with simple requests...');
        console.log('\n📝 Test 1: Basic corporate endpoint...');
        const corporateResponse = await fetch('http://localhost:3001/corporates/16');
        if (corporateResponse.ok) {
            console.log('✅ Corporate endpoint works');
        }
        else {
            console.log('❌ Corporate endpoint failed:', corporateResponse.status);
        }
        console.log('\n📝 Test 2: Amendment requests endpoint without query...');
        try {
            const amendmentResponse = await fetch('http://localhost:3001/corporates/amendment-requests');
            console.log('Response status:', amendmentResponse.status);
            console.log('Response headers:', Object.fromEntries(amendmentResponse.headers.entries()));
            if (amendmentResponse.ok) {
                const data = await amendmentResponse.json();
                console.log('✅ Amendment requests endpoint works:', data);
            }
            else {
                const errorText = await amendmentResponse.text();
                console.log('❌ Amendment requests endpoint failed:', errorText);
            }
        }
        catch (error) {
            console.log('❌ Amendment requests endpoint error:', error.message);
        }
        console.log('\n📝 Test 3: Amendment requests endpoint with query...');
        try {
            const amendmentResponseWithQuery = await fetch('http://localhost:3001/corporates/amendment-requests?corporateId=16');
            console.log('Response status:', amendmentResponseWithQuery.status);
            if (amendmentResponseWithQuery.ok) {
                const data = await amendmentResponseWithQuery.json();
                console.log('✅ Amendment requests endpoint with query works:', data);
            }
            else {
                const errorText = await amendmentResponseWithQuery.text();
                console.log('❌ Amendment requests endpoint with query failed:', errorText);
            }
        }
        catch (error) {
            console.log('❌ Amendment requests endpoint with query error:', error.message);
        }
        console.log('\n🎉 API testing completed!');
    }
    catch (error) {
        console.error('❌ API testing failed:', error);
    }
}
testAPISimple().catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
});
//# sourceMappingURL=test_api_simple.js.map