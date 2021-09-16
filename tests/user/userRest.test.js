beforeEach(() => {
    return testData();
});

describe("POST /auth/register", () => {

});

describe("POST /auth/login", () => {
    // Wrong email
    // wrong password
    // Correct
});

describe("POST /users", () => {
    // Admin can create user
    // Manager can create user
    // Regular user cannot create user
});

describe("GET /users", () => {
    // Admin can get users
    // Manager can get users
    // Regular user cannot get users
    // Unauthorized user cannot get users
    // Support pagination
    // Support filter
});

describe("GET /users/:id", () => {
    // Admin can get user by Id
    // Manager can get user by Id
    // Regular user can get own profile
    // Regular user cannot get other user profile
    // Unauthorized user cannot get user by Id
});

describe("PUT /users/:id", () => {
    // Admin can update user
    // Manager can update user
    // Regular user can update own profile
    // Regular user cannot update other user profile
    // Unauthorized user cannot update user
});

describe("DELETE /users/:id", () => {
    // Admin can update user
    // Manager can update user
    // Regular user can update own profile
    // Regular user cannot update other user profile
    // Unauthorized user cannot update user
});

function testData() {

}
