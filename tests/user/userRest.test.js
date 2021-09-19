const TestUser = require("./testUser");
const database = require('../../db/database');

beforeEach(async () => {
    await database.connect();
    await createTestUsers();
});
afterEach(database.clearDatabase);

async function createTestUsers() {
    await TestUser.register({email: 'admin@mail.com', password: 'admin123', role: 'admin'});
    await TestUser.register({email: 'manager@mail.com', password: 'manager123', role: 'manager'});
    await TestUser.register({email: 'regular1@mail.com', password: 'regular1123', role: 'regular'});
    await TestUser.register({email: 'regular2@mail.com', password: 'regular2123', role: 'regular'});
}

describe("POST /auth/register", () => {
    it('User register successfully', testRegisterSuccessfully);
    it('User register with existing email should fail', testRegisterWithExistingEmailShouldFail);
});

async function testRegisterSuccessfully() {
    const response = await TestUser.register({email: 'new.user@mail.com', password: 'newuser123'});
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('_id');
    expect(response.body.user).not.toHaveProperty('password');
    expect(response.body.user.email).toEqual('new.user@mail.com');
}

async function testRegisterWithExistingEmailShouldFail() {
    const response = await TestUser.register({email: 'regular1@mail.com', password: 'password'});
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Email already exists.');
}

describe("POST /auth/login", () => {
    it('User login successfully', testLoginSuccessfully);
    it('User login with wrong email should fail', testLoginWithWrongEmailShouldFail);
    it('User login with wrong password should fail', testLoginWithWrongPasswordShouldFail);
});

async function testLoginSuccessfully() {
    const response = await TestUser.login("regular1@mail.com", "regular1123");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('auth-token');
}

async function testLoginWithWrongEmailShouldFail() {
    const response = await TestUser.login("wrong-email@mail.com", "regular1123");
    expect(response.status).toBe(400);
}

async function testLoginWithWrongPasswordShouldFail() {
    const response = await TestUser.login("regular1@mail.com", "wrongPassword");
    expect(response.status).toBe(400);
}

describe("GET /users", () => {
    it('admin can get users', testAdminCanGetUsers);
    it('manager can get users', testManagerCanGetUsers);
    it('regular user cannot get users', testRegularUserCannotGetUsers);
    it('unauthorized user cannot get users', testUnauthorizedUserCannotGetUsers);
    it('test filter users', testFilterUsers);
    it('test pagination when get users', testPaginationWhenGetUsers);
});

async function testAdminCanGetUsers() {
    const token = (await TestUser.login("admin@mail.com", "admin123")).body['auth-token'];
    const response = await TestUser.find(null, null, null, token);
    expect(response.status).toBe(200);
    const userEmails = response.body.users.map(user => user.email);
    expect(userEmails).toEqual(['admin@mail.com', 'manager@mail.com', 'regular1@mail.com', 'regular2@mail.com']);
}

async function testManagerCanGetUsers() {
    const token = (await TestUser.login("manager@mail.com", "manager123")).body['auth-token'];
    const response = await TestUser.find(null, null, null, token);
    expect(response.status).toBe(200);
    const userEmails = response.body.users.map(user => user.email);
    expect(userEmails).toEqual(['admin@mail.com', 'manager@mail.com', 'regular1@mail.com', 'regular2@mail.com']);
}

async function testRegularUserCannotGetUsers() {
    const token = (await TestUser.login("regular1@mail.com", "regular1123")).body['auth-token'];
    const response = await TestUser.find(null, null, null, token);
    expect(response.status).toBe(401);
}

async function testUnauthorizedUserCannotGetUsers() {
    const response = await TestUser.find(null, null, null, null);
    expect(response.status).toBe(401);
}

async function testFilterUsers() {
    const token = (await TestUser.login("admin@mail.com", "admin123")).body['auth-token'];
    const response = await TestUser.find("email eq 'regular1@mail.com'", null, null, token);
    expect(response.status).toBe(200);
    expect(response.body.users).toHaveLength(1);
    expect(response.body.users[0].email).toEqual('regular1@mail.com');
}

async function testPaginationWhenGetUsers() {
    const token = (await TestUser.login("admin@mail.com", "admin123")).body['auth-token'];
    const response = await TestUser.find(null, 1, 2, token);
    expect(response.status).toBe(200);
    expect(response.body.users).toHaveLength(2);
    expect(response.body.total).toBe(4);

    const response2 = await TestUser.find(null, 2, 3, token);
    expect(response2.status).toBe(200);
    expect(response2.body.users).toHaveLength(1);
    expect(response2.body.total).toBe(4);
}

describe("GET /users/:id", () => {
    it('admin can get user by id', testAdminCanGetUserById);
    it('manager can get user by id', testManagerCanGetUserById);
    it('regular user can get own profile', testRegularUserCanGetOwnProfile);
    it('regular user cannot get other user by id', testRegularUserCannotGetOtherUser);
    it('unauthorized user cannot get other user by id', testUnauthorizedUserCannotGetOtherUser);
});

async function testAdminCanGetUserById() {
    const token = (await TestUser.login("admin@mail.com", "admin123")).body['auth-token'];
    const user = (await TestUser.find("email eq 'regular1@mail.com'", null, null, token)).body.users[0];

    const response = await TestUser.findById(user._id, token);
    expect(response.status).toBe(200);
    expect(response.body.user.email).toEqual('regular1@mail.com');
}

async function testManagerCanGetUserById() {
    const token = (await TestUser.login("manager@mail.com", "manager123")).body['auth-token'];
    const user = (await TestUser.find("email eq 'regular1@mail.com'", null, null, token)).body.users[0];

    const response = await TestUser.findById(user._id, token);
    expect(response.status).toBe(200);
    expect(response.body.user.email).toEqual('regular1@mail.com');
}

async function testRegularUserCanGetOwnProfile() {
    const adminToken = (await TestUser.login("admin@mail.com", "admin123")).body['auth-token'];
    const user = (await TestUser.find("email eq 'regular1@mail.com'", null, null, adminToken)).body.users[0];

    const token = (await TestUser.login("regular1@mail.com", "regular1123")).body['auth-token'];
    const response = await TestUser.findById(user._id, token);
    expect(response.status).toBe(200);
    expect(response.body.user.email).toEqual('regular1@mail.com');
}

async function testRegularUserCannotGetOtherUser() {
    const adminToken = (await TestUser.login("admin@mail.com", "admin123")).body['auth-token'];
    const user = (await TestUser.find("email eq 'regular2@mail.com'", null, null, adminToken)).body.users[0];

    const token = (await TestUser.login("regular1@mail.com", "regular1123")).body['auth-token'];
    const response = await TestUser.findById(user._id, token);
    expect(response.status).toBe(401);
}

async function testUnauthorizedUserCannotGetOtherUser() {
    const adminToken = (await TestUser.login("admin@mail.com", "admin123")).body['auth-token'];
    const user = (await TestUser.find("email eq 'regular1@mail.com'", null, null, adminToken)).body.users[0];

    const response = await TestUser.findById(user._id, null);
    expect(response.status).toBe(401);
}

describe("PUT /users/:id", () => {
    it('admin can update user', testAdminCanUpdateUser);
    it('manager can update user', testManagerCanUpdateUser);
    it('regular user can update own profile', testRegularUserCanUpdateOwnProfile);
    it('regular user cannot update other user', testRegularUserCannotUpdateOtherUser);
    it('unauthorized user cannot update user', testUnauthorizedUserCannotUpdateUser);
});

async function testAdminCanUpdateUser() {
    const token = (await TestUser.login("admin@mail.com", "admin123")).body['auth-token'];
    const user = (await TestUser.find("email eq 'regular1@mail.com'", null, null, token)).body.users[0];

    const response = await TestUser.update(user._id, {expectedCaloriesPerDay: 3000}, token);
    expect(response.status).toBe(200);

    const updated = await TestUser.findById(user._id, token);
    expect(updated.body.user.expectedCaloriesPerDay).toEqual(3000);
}

async function testManagerCanUpdateUser() {
    const token = (await TestUser.login("manager@mail.com", "manager123")).body['auth-token'];
    const user = (await TestUser.find("email eq 'regular1@mail.com'", null, null, token)).body.users[0];

    const response = await TestUser.update(user._id, {expectedCaloriesPerDay: 3000}, token);
    expect(response.status).toBe(200);

    const updated = await TestUser.findById(user._id, token);
    expect(updated.body.user.expectedCaloriesPerDay).toEqual(3000);
}

async function testRegularUserCanUpdateOwnProfile() {
    const adminToken = (await TestUser.login("admin@mail.com", "admin123")).body['auth-token'];
    const user = (await TestUser.find("email eq 'regular1@mail.com'", null, null, adminToken)).body.users[0];

    const token = (await TestUser.login("regular1@mail.com", "regular1123")).body['auth-token'];
    const response = await TestUser.update(user._id, {expectedCaloriesPerDay: 3000}, token);
    expect(response.status).toBe(200);

    const updated = await TestUser.findById(user._id, token);
    expect(updated.body.user.expectedCaloriesPerDay).toEqual(3000);
}

async function testRegularUserCannotUpdateOtherUser() {
    const adminToken = (await TestUser.login("admin@mail.com", "admin123")).body['auth-token'];
    const user = (await TestUser.find("email eq 'regular2@mail.com'", null, null, adminToken)).body.users[0];

    const token = (await TestUser.login("regular1@mail.com", "regular1123")).body['auth-token'];
    const response = await TestUser.update(user._id, {expectedCaloriesPerDay: 3000}, token);
    expect(response.status).toBe(401);
}

async function testUnauthorizedUserCannotUpdateUser() {
    const adminToken = (await TestUser.login("admin@mail.com", "admin123")).body['auth-token'];
    const user = (await TestUser.find("email eq 'regular1@mail.com'", null, null, adminToken)).body.users[0];

    const response = await TestUser.update(user._id, {expectedCaloriesPerDay: 3000}, null);
    expect(response.status).toBe(401);
}

describe("DELETE /users/:id", () => {
    it('admin can delete user', testAdminCanDeleteUser);
    it('manager can delete user', testManagerCanDeleteUser);
    it('regular user can delete own profile', testRegularUserCanDeleteOwnProfile);
    it('regular user cannot delete other user', testRegularUserCannotDeleteOtherUser);
    it('unauthorized user cannot delete user', testUnauthorizedUserCannotDeleteUser);
});

async function testAdminCanDeleteUser() {
    const token = (await TestUser.login("admin@mail.com", "admin123")).body['auth-token'];
    const user = (await TestUser.find("email eq 'regular1@mail.com'", null, null, token)).body.users[0];

    const response = await TestUser.remove(user._id, token);
    expect(response.status).toBe(200);

    const deleted = await TestUser.findById(user._id, token);
    expect(deleted.status).toBe(404);
    expect(deleted.body.error).toEqual('User not found');
}

async function testManagerCanDeleteUser() {
    const token = (await TestUser.login("manager@mail.com", "manager123")).body['auth-token'];
    const user = (await TestUser.find("email eq 'regular1@mail.com'", null, null, token)).body.users[0];

    const response = await TestUser.remove(user._id, token);
    expect(response.status).toBe(200);

    const deleted = await TestUser.findById(user._id, token);
    expect(deleted.status).toBe(404);
    expect(deleted.body.error).toEqual('User not found');
}

async function testRegularUserCanDeleteOwnProfile() {
    const adminToken = (await TestUser.login("admin@mail.com", "admin123")).body['auth-token'];
    const user = (await TestUser.find("email eq 'regular1@mail.com'", null, null, adminToken)).body.users[0];

    const token = (await TestUser.login("regular1@mail.com", "regular1123")).body['auth-token'];
    const response = await TestUser.remove(user._id, token);
    expect(response.status).toBe(200);

    const deleted = await TestUser.findById(user._id, token);
    expect(deleted.status).toBe(404);
    expect(deleted.body.error).toEqual('User not found');
}

async function testRegularUserCannotDeleteOtherUser() {
    const adminToken = (await TestUser.login("admin@mail.com", "admin123")).body['auth-token'];
    const user = (await TestUser.find("email eq 'regular2@mail.com'", null, null, adminToken)).body.users[0];

    const token = (await TestUser.login("regular1@mail.com", "regular1123")).body['auth-token'];
    const response = await TestUser.remove(user._id, token);
    expect(response.status).toBe(401);
}

async function testUnauthorizedUserCannotDeleteUser() {
    const adminToken = (await TestUser.login("admin@mail.com", "admin123")).body['auth-token'];
    const user = (await TestUser.find("email eq 'regular1@mail.com'", null, null, adminToken)).body.users[0];

    const response = await TestUser.remove(user._id, null);
    expect(response.status).toBe(401);
}
