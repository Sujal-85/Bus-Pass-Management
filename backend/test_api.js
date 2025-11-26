const http = require('http');

const data = JSON.stringify({
    formType: 'Diploma',
    date: '2023-10-27',
    academicYear: '2023-2024',
    studentId: '12345',
    studentName: 'Test Student',
    mobileNo: '1234567890',
    EmailId: 'test@example.com',
    department: 'Computer',
    class: '1st Year',
    semester: '1',
    busRoute: 'Route 1',
    routeTo: 'Stop A',
    passType: 'semester',
    passAmount: 1000,
    receivedAmount: 1000,
    pendingAmount: 0
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/bus-pass',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(data);
req.end();
