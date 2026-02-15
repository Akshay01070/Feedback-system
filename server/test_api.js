// Test the API directly from the command line
const http = require('http');

function makeRequest(method, path, body) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        console.log(`\n>>> ${method} http://localhost:5000${path}`);
        console.log('>>> Body:', data);

        const req = http.request(options, (res) => {
            let responseBody = '';
            res.on('data', chunk => responseBody += chunk);
            res.on('end', () => {
                console.log(`<<< Status: ${res.statusCode}`);
                console.log(`<<< Response: ${responseBody}`);
                resolve({ status: res.statusCode, body: responseBody });
            });
        });

        req.on('error', (err) => {
            console.error(`!!! Request Error: ${err.message}`);
            reject(err);
        });

        req.write(data);
        req.end();
    });
}

async function runTests() {
    console.log('========================================');
    console.log('API TEST - Testing Login & Register');
    console.log('========================================');

    // Test 1: Login with student
    console.log('\n--- TEST 1: Login as student ---');
    await makeRequest('POST', '/api/auth/login', {
        email: 'student@test.com',
        password: 'Test@123'
    });

    // Test 2: Login with teacher
    console.log('\n--- TEST 2: Login as teacher ---');
    await makeRequest('POST', '/api/auth/login', {
        email: 'teacher@test.com',
        password: 'Test@123'
    });

    // Test 3: Register new student
    console.log('\n--- TEST 3: Register new student ---');
    await makeRequest('POST', '/api/auth/register', {
        email: 'newstudent@test.com',
        password: 'Test@123',
        role: 'student'
    });

    console.log('\n========================================');
    console.log('TESTS COMPLETE');
    console.log('========================================');
}

runTests().catch(err => console.error('Fatal:', err));
