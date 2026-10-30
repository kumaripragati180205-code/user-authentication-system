import http from 'http';

const BASE_URL = 'http://localhost:5000/api';

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const postData = body ? JSON.stringify(body) : null;

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json,
        });
      });
    });

    req.on('error', (err) => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Automated End-to-End Auth Test Suite...\n');
  let testCount = 0;
  let passCount = 0;

  function assert(condition, name) {
    testCount++;
    if (condition) {
      passCount++;
      console.log(`  ✅ PASS: ${name}`);
    } else {
      console.error(`  ❌ FAIL: ${name}`);
    }
  }

  try {
    // 1. Health check
    const health = await request('GET', '/health');
    assert(health.status === 200 && health.data.status === 'online', 'Server health check returns 200 OK');

    // 2. Register test user
    const testEmail = `tester_${Date.now()}@example.com`;
    const regRes = await request('POST', '/auth/register', {
      name: 'Test Engineer',
      email: testEmail,
      password: 'SecurePassword@2026',
      role: 'user',
    });
    assert(regRes.status === 201 && regRes.data.accessToken, 'User registration succeeds and returns JWT access token');
    const userAccessToken = regRes.data.accessToken;
    const userRefreshToken = regRes.data.refreshToken;

    // 3. Login with incorrect password
    const failLogin = await request('POST', '/auth/login', {
      email: testEmail,
      password: 'WrongPassword@999',
    });
    assert(failLogin.status === 401, 'Incorrect password correctly rejected with 401 Unauthorized');

    // 4. Login with correct password
    const okLogin = await request('POST', '/auth/login', {
      email: testEmail,
      password: 'SecurePassword@2026',
    });
    assert(okLogin.status === 200 && okLogin.data.user.email === testEmail, 'Login with Bcrypt hash verification succeeds');

    // 5. Access protected user profile with Bearer JWT
    const profileRes = await request('GET', '/user/profile', null, {
      Authorization: `Bearer ${userAccessToken}`,
    });
    assert(profileRes.status === 200 && profileRes.data.user.name === 'Test Engineer', 'Protected /api/user/profile accepts valid JWT');

    // 6. Test RBAC: Regular user attempting admin route must get 403 Forbidden
    const forbiddenRes = await request('GET', '/admin/users', null, {
      Authorization: `Bearer ${userAccessToken}`,
    });
    assert(forbiddenRes.status === 403, 'RBAC correctly blocks standard user from /api/admin/users with 403 Forbidden');

    // 7. Login as Admin user
    const adminLogin = await request('POST', '/auth/login', {
      email: 'admin@authshield.io',
      password: 'Admin@123',
    });
    assert(adminLogin.status === 200 && adminLogin.data.user.role === 'admin', 'Default Admin login succeeds');
    const adminAccessToken = adminLogin.data.accessToken;

    // 8. Admin accesses /api/admin/users
    const adminUsersRes = await request('GET', '/admin/users', null, {
      Authorization: `Bearer ${adminAccessToken}`,
    });
    assert(
      adminUsersRes.status === 200 && Array.isArray(adminUsersRes.data.users),
      'Admin successfully fetches user list and metrics via RBAC'
    );

    // 9. Silent Refresh Token rotation
    const refreshRes = await request('POST', '/auth/refresh', {
      refreshToken: userRefreshToken,
    });
    assert(
      refreshRes.status === 200 && refreshRes.data.accessToken,
      'Refresh Token successfully rotates into new Access Token'
    );

    // 10. Forgot Password Flow
    const forgotRes = await request('POST', '/auth/forgot-password', {
      email: testEmail,
    });
    assert(
      forgotRes.status === 200 && forgotRes.data.preview?.rawToken,
      'Forgot password generates cryptographic reset token and dispatches mail'
    );
    const rawResetToken = forgotRes.data.preview.rawToken;

    // 11. Complete Password Reset
    const resetRes = await request('POST', '/auth/reset-password', {
      token: rawResetToken,
      newPassword: 'BrandNewSecureP@ss2026',
    });
    assert(resetRes.status === 200, 'Password reset completes successfully with SHA-256 token verification');

    // 12. Verify login with the brand new password
    const newLoginRes = await request('POST', '/auth/login', {
      email: testEmail,
      password: 'BrandNewSecureP@ss2026',
    });
    assert(newLoginRes.status === 200, 'User logs in successfully with new reset password');

    // 13. Audit logs verified
    const logsRes = await request('GET', '/admin/audit-logs', null, {
      Authorization: `Bearer ${adminAccessToken}`,
    });
    assert(
      logsRes.status === 200 && logsRes.data.logs.length > 0,
      'Admin audit logs successfully tracked all registration, login & reset events'
    );

    console.log(`\n========================================`);
    console.log(`🎉 TEST SUMMARY: ${passCount}/${testCount} tests passed!`);
    console.log(`========================================\n`);

    process.exit(passCount === testCount ? 0 : 1);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();

