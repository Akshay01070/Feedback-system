const http = require('http');

function testLogin(email, password) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ email, password });

        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                console.log(`Testing ${email}...`);
                console.log(`  Status: ${res.statusCode}`);
                try {
                    const parsed = JSON.parse(body);
                    if (res.statusCode === 200) {
                        console.log(`  ✓ Login successful! Role: ${parsed.role}`);
                    } else {
                        console.log(`  ✗ Login failed: ${parsed.msg || body}`);
                    }
                } catch (e) {
                    console.log(`  Response: ${body}`);
                }
                console.log('');
                resolve();
            });
        });

        req.on('error', (error) => {
            console.log(`  ✗ Error: ${error.message}`);
            resolve();
        });

        req.write(data);
        req.end();
    });
}

async function main() {
    console.log('Testing Login API...\n');
    await testLogin('student@test.com', 'Test@123');
    await testLogin('teacher@test.com', 'Test@123');
    await testLogin('admin@test.com', 'Test@123');
}

main();
