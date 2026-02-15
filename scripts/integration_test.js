const axios = require('axios');
const { Identity } = require('@semaphore-protocol/identity');
const { Group } = require('@semaphore-protocol/group');

// Configuration
const API_URL = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@college.edu';
const ADMIN_PASS = 'admin123';
const STUDENT_EMAIL = 'student@college.edu';
const STUDENT_PASS = 'student123';

async function runIntegrationTest() {
    console.log("Starting Integration Test...");

    try {
        // 1. Register Admin
        console.log("\n1. Registering Admin...");
        try {
            await axios.post(`${API_URL}/auth/register`, {
                email: ADMIN_EMAIL,
                password: ADMIN_PASS,
                role: 'admin'
            });
            console.log("Admin Registered.");
        } catch (e) { console.log("Admin might already exist, logging in..."); }

        // 2. Login Admin
        console.log("2. Logging in Admin...");
        const adminLogin = await axios.post(`${API_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASS
        });
        const adminToken = adminLogin.data.token;
        console.log("Admin Logged In.");

        // 3. Register Student
        console.log("\n3. Registering Student...");
        try {
            await axios.post(`${API_URL}/auth/register`, {
                email: STUDENT_EMAIL,
                password: STUDENT_PASS,
                role: 'student'
            });
            console.log("Student Registered.");
        } catch (e) { console.log("Student might already exist..."); }

        // 4. Login Student
        console.log("4. Logging in Student...");
        const studentLogin = await axios.post(`${API_URL}/auth/login`, {
            email: STUDENT_EMAIL,
            password: STUDENT_PASS
        });
        const studentToken = studentLogin.data.token;
        const studentId = studentLogin.data.userId; // Assuming backend returns userId
        console.log("Student Logged In.");

        // 5. Create Semaphore Identity (Client Side Simulation)
        console.log("\n5. Generating Semaphore Identity...");
        const identity = new Identity();
        const commitment = identity.commitment.toString();
        console.log("Identity Created. Commitment:", commitment);

        // 6. Send Commitment to Admin (Student Action)
        console.log("6. Submitting Identity to Admin...");
        await axios.post(`${API_URL}/admin/add-student-identity`, {
            userId: studentId,
            identityCommitment: commitment
        }, {
            headers: { Authorization: adminToken } // Using admin token for verify endpoint (simplified)
        });
        console.log("Identity Submitted to Backend.");

        // 7. Verify Batching Trigger (Mocked)
        // We can simulate adding more users to trigger the batch of 5
        // But for this test, we just check if it was accepted.
        console.log("Integration Test Passed: User Flow Complete (Auth -> Identity -> Backend Storage)");

    } catch (err) {
        console.error("Test Failed:", err.response ? err.response.data : err.message);
    }
}

runIntegrationTest();
