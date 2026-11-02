/**
 * Automated Verification Script for TaskFlow Backend APIs
 * Demonstrates:
 * - Full Authentication flow (Register, Login, Token generation)
 * - Middleware Authorization (Protected routes, Token validation)
 * - Error handling for duplicate records and invalid credentials
 * - Full CRUD on Tasks (Create, Read, Update, Delete)
 * - Query filters & Statistics
 * - IDOR Authorization Security Check between different users
 */

const http = require('http');

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;

// Helper function to send HTTP requests
function sendRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data, headers: res.headers });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

async function runTests() {
  console.log('\n--- 🚀 Starting TaskFlow Backend Verification Tests ---\n');

  const timestamp = Date.now();
  const testUserA = {
    name: 'Alice Johnson',
    email: `alice_${timestamp}@university.edu`,
    password: 'Password123!'
  };

  const testUserB = {
    name: 'Bob Smith',
    email: `bob_${timestamp}@university.edu`,
    password: 'Password123!'
  };

  // 1. Health Check
  console.log('1. Testing Health Endpoint: GET /api/health');
  const healthRes = await sendRequest({
    hostname: 'localhost',
    port: PORT,
    path: '/api/health',
    method: 'GET'
  });
  assert(healthRes.status === 200 && healthRes.data.status === 'UP', 'Health check returns 200 UP');

  // 2. User A Registration
  console.log('\n2. Testing User Registration: POST /api/auth/register');
  const regRes = await sendRequest(
    {
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    testUserA
  );
  assert(regRes.status === 201, 'User A registered with 201 Created');
  assert(regRes.data.token && typeof regRes.data.token === 'string', 'JWT token issued upon registration');
  assert(regRes.data.user.email === testUserA.email, 'User profile returned with email');
  assert(regRes.data.user.password === undefined, 'Password hash is NOT exposed in response');
  const tokenA = regRes.data.token;

  // 3. Duplicate User Registration Validation
  console.log('\n3. Testing Duplicate Registration Prevention');
  const dupRes = await sendRequest(
    {
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    testUserA
  );
  assert(dupRes.status === 400, 'Duplicate email registration correctly rejected with 400 Bad Request');

  // 4. User Login with Correct Credentials
  console.log('\n4. Testing User Login: POST /api/auth/login');
  const loginRes = await sendRequest(
    {
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    { email: testUserA.email, password: testUserA.password }
  );
  assert(loginRes.status === 200, 'Login succeeded with 200 OK');
  assert(loginRes.data.token, 'Login returned valid JWT token');

  // 5. User Login with Invalid Password
  console.log('\n5. Testing Login with Invalid Password');
  const badLoginRes = await sendRequest(
    {
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    { email: testUserA.email, password: 'WrongPassword' }
  );
  assert(badLoginRes.status === 401, 'Invalid credentials rejected with 401 Unauthorized');

  // 6. Access Protected Route Without Token
  console.log('\n6. Testing Access to Protected Route Without Token: GET /api/auth/profile');
  const noTokenRes = await sendRequest({
    hostname: 'localhost',
    port: PORT,
    path: '/api/auth/profile',
    method: 'GET'
  });
  assert(noTokenRes.status === 401, 'Protected route denied with 401 when token is missing');

  // 7. Access Protected Route With Valid Token
  console.log('\n7. Testing Access to Protected Route With Valid Token');
  const profileRes = await sendRequest({
    hostname: 'localhost',
    port: PORT,
    path: '/api/auth/profile',
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  assert(profileRes.status === 200 && profileRes.data.user.name === testUserA.name, 'Profile retrieved with Bearer token');

  // 8. Create Task for User A
  console.log('\n8. Testing Task Creation: POST /api/tasks');
  const task1Res = await sendRequest(
    {
      hostname: 'localhost',
      port: PORT,
      path: '/api/tasks',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      }
    },
    {
      title: 'Submit Backend Lab Project',
      description: 'Prepare complete source code, README documentation, and test cases.',
      priority: 'High',
      status: 'Pending',
      deadline: new Date(Date.now() + 86400000 * 3).toISOString()
    }
  );
  assert(task1Res.status === 201, 'Task created with 201 Created');
  const task1 = task1Res.data.task;
  assert(task1.title === 'Submit Backend Lab Project', 'Task title correctly saved');
  assert(task1.priority === 'High', 'Priority correctly set to High');

  // Create another task for User A
  const task2Res = await sendRequest(
    {
      hostname: 'localhost',
      port: PORT,
      path: '/api/tasks',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      }
    },
    {
      title: 'Review Mongoose Schema Documentation',
      description: 'Study indexing, pre-save hooks, and model validations.',
      priority: 'Medium',
      status: 'In Progress',
      deadline: new Date(Date.now() + 86400000 * 5).toISOString()
    }
  );
  assert(task2Res.status === 201, 'Second task created successfully');

  // 9. List All Tasks for User A
  console.log('\n9. Testing Task Retrieval: GET /api/tasks');
  const listRes = await sendRequest({
    hostname: 'localhost',
    port: PORT,
    path: '/api/tasks',
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  assert(listRes.status === 200 && listRes.data.tasks.length === 2, 'Retrieved all tasks for User A (count = 2)');

  // 10. Filter Tasks by Status
  console.log('\n10. Testing Task Filtering: GET /api/tasks?status=Pending');
  const filterRes = await sendRequest({
    hostname: 'localhost',
    port: PORT,
    path: '/api/tasks?status=Pending',
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  assert(filterRes.status === 200 && filterRes.data.tasks.length === 1, 'Status filter returned only Pending tasks');

  // 11. Search Tasks by Keyword
  console.log('\n11. Testing Task Search: GET /api/tasks?search=Backend');
  const searchRes = await sendRequest({
    hostname: 'localhost',
    port: PORT,
    path: '/api/tasks?search=Backend',
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  assert(searchRes.status === 200 && searchRes.data.tasks.length === 1, 'Search query found matching task');

  // 12. Update Task
  console.log('\n12. Testing Task Update: PUT /api/tasks/:id');
  const updateRes = await sendRequest(
    {
      hostname: 'localhost',
      port: PORT,
      path: `/api/tasks/${task1._id}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      }
    },
    {
      status: 'Completed',
      priority: 'Medium'
    }
  );
  assert(updateRes.status === 200 && updateRes.data.task.status === 'Completed', 'Task status updated to Completed');

  // 13. Task Statistics
  console.log('\n13. Testing Task Statistics: GET /api/tasks/stats');
  const statsRes = await sendRequest({
    hostname: 'localhost',
    port: PORT,
    path: '/api/tasks/stats',
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  assert(statsRes.status === 200, 'Stats endpoint returns 200 OK');
  assert(statsRes.data.stats.total === 2, 'Total tasks count is 2');
  assert(statsRes.data.stats.completed === 1, 'Completed tasks count is 1');
  assert(statsRes.data.stats.inProgress === 1, 'In Progress tasks count is 1');
  assert(statsRes.data.stats.completionRate === 50, 'Completion rate is 50%');

  // 14. Register User B & Test IDOR Security Protection
  console.log('\n14. Testing IDOR Protection (User B trying to access/modify/delete User A\'s task)');
  const regBRes = await sendRequest(
    {
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    testUserB
  );
  const tokenB = regBRes.data.token;

  // User B tries to GET User A's task
  const idorGetRes = await sendRequest({
    hostname: 'localhost',
    port: PORT,
    path: `/api/tasks/${task1._id}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  assert(idorGetRes.status === 403, 'User B blocked from viewing User A\'s task (403 Forbidden)');

  // User B tries to PUT User A's task
  const idorPutRes = await sendRequest(
    {
      hostname: 'localhost',
      port: PORT,
      path: `/api/tasks/${task1._id}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`
      }
    },
    { title: 'Hacked Title' }
  );
  assert(idorPutRes.status === 403, 'User B blocked from updating User A\'s task (403 Forbidden)');

  // User B tries to DELETE User A's task
  const idorDeleteRes = await sendRequest({
    hostname: 'localhost',
    port: PORT,
    path: `/api/tasks/${task1._id}`,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  assert(idorDeleteRes.status === 403, 'User B blocked from deleting User A\'s task (403 Forbidden)');

  // 15. User A deletes their own task
  console.log('\n15. Testing Task Deletion: DELETE /api/tasks/:id');
  const deleteRes = await sendRequest({
    hostname: 'localhost',
    port: PORT,
    path: `/api/tasks/${task1._id}`,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  assert(deleteRes.status === 200, 'User A successfully deleted task');

  // Verify task no longer in list
  const finalListRes = await sendRequest({
    hostname: 'localhost',
    port: PORT,
    path: '/api/tasks',
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  assert(finalListRes.data.tasks.length === 1, 'Task count decreased to 1 after deletion');

  console.log('\n🎉 ALL 15 BACKEND TESTS PASSED SUCCESSFULLY! 🎉\n');
}

module.exports = { runTests };

if (require.main === module) {
  runTests().catch((err) => {
    console.error('Test error:', err);
    process.exit(1);
  });
}

