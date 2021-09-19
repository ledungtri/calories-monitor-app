const TestUser = require("../user/testUser");
const TestRecord = require("./testRecord");
const database = require('../../db/database');

let admin = {}, manager = {}, regularUser1 = {}, regularUser2 = {};
let adminToken = '', managerToken = '', regularUser1Token = '', regularUser2Token = '';
let user1Record1 = {}, user1Record2 = {}, user2Record1 = {}, user2Record2= {};

beforeEach(async () => {
    await database.connect();
    await createTestUsers();
    await createTestRecords();
});
afterEach(database.clearDatabase);

async function createTestUsers() {
    admin = (await TestUser.register({email: 'admin@mail.com', password: 'admin123', role: 'admin'})).body.user;
    manager = (await TestUser.register({email: 'manager@mail.com', password: 'manager123', role: 'manager'})).body.user;
    regularUser1 = (await TestUser.register({email: 'regular1@mail.com', password: 'regular1123', role: 'regular'})).body.user;
    regularUser2 = (await TestUser.register({email: 'regular2@mail.com', password: 'regular2123', role: 'regular'})).body.user;

    adminToken = (await TestUser.login("admin@mail.com", "admin123")).body['auth-token'];
    managerToken = (await TestUser.login("manager@mail.com", "manager123")).body['auth-token'];
    regularUser1Token = (await TestUser.login("regular1@mail.com", "regular1123")).body['auth-token'];
    regularUser2Token = (await TestUser.login("regular2@mail.com", "regular2123")).body['auth-token'];
}

async function createTestRecords() {
    user1Record1 = (await TestRecord.create({meal: 'cheeseburger', calories: 300}, regularUser1Token)).body.record;
    user1Record2 = (await TestRecord.create({meal: 'hamburger', calories: 300}, regularUser1Token)).body.record;
    user2Record1 = (await TestRecord.create({meal: 'sushi', calories: 300}, regularUser2Token)).body.record;
    user2Record2 = (await TestRecord.create({meal: 'ramen', calories: 300}, regularUser2Token)).body.record;
}

describe("POST /records", () => {
    it("User can create own record", testRegularUserCanCreateRecord);
    it("Unauthorized user cannot create record", testUnauthorizedUserCannotCreateRecord);
    it("Test auto generated calories", testAutoGenerateCalories);
    it("Test set exceededCaloriesPerDay flag", testSetExceededCaloriesPerDayFlag);
});

async function testRegularUserCanCreateRecord() {
    const response = await TestRecord.create({meal: 'burger', calories: 300}, regularUser1Token);
    expect(response.status).toBe(200);
    expect(response.body.record.userId).toEqual(regularUser1._id);
    expect(response.body.record.meal).toEqual('burger');
}

async function testUnauthorizedUserCannotCreateRecord() {
    const response = await TestRecord.create({userId: regularUser1._id, meal: 'burger'}, null);
    expect(response.status).toBe(401);
}

async function testAutoGenerateCalories() {
    const response = await TestRecord.create({meal: 'mac and cheese'}, regularUser1Token);
    expect(response.status).toBe(200);
    expect(response.body.record.calories).not.toEqual(0);
}

async function testSetExceededCaloriesPerDayFlag() {
    const res = await TestUser.update(regularUser1._id, {expectedCaloriesPerDay: 700}, regularUser1Token);
    const response = await TestRecord.create({meal: 'mac and cheese'}, regularUser1Token);
    expect(response.status).toBe(200);
    expect(response.body.record.exceededCaloriesPerDay).toBe(true);
}

describe("GET /records", () => {
    it("Admin can get records for any user", testAdminCanGetRecords);
    it("Regular user can get own records", testUserCanGetOwnRecords);
    it("Unauthorized user cannot get records", testUnauthorizedUserCannotGetRecords);
    it("Test filter records", testFilterRecords);
    it("Test pagination when get records", testPaginationWhenGetRecords);
});

async function testAdminCanGetRecords() {
    const response = await TestRecord.find(null, null, null, adminToken);
    expect(response.status).toBe(200);
    expect(response.body.records).toHaveLength(4);
    const recordIds = response.body.records.map(record => record._id);
    const expectedRecordIds = [user1Record1, user1Record2, user2Record1, user2Record2].map(record => record._id);
    expect(recordIds).toEqual(expectedRecordIds);
}

async function testUserCanGetOwnRecords() {
    const response = await TestRecord.find(null, null, null, regularUser1Token);
    expect(response.status).toBe(200);
    expect(response.body.records).toHaveLength(2);
    const recordIds = response.body.records.map(record => record._id);
    const expectedRecordIds = [user1Record1, user1Record2].map(record => record._id);
    expect(recordIds).toEqual(expectedRecordIds);
}

async function testUnauthorizedUserCannotGetRecords() {
    const response = await TestRecord.find(null, null, null, null);
    expect(response.status).toBe(401);
}

async function testFilterRecords() {
    const response = await TestRecord.find("meal eq 'sushi'", null, null, adminToken);
    expect(response.status).toBe(200);
    expect(response.body.records).toHaveLength(1);
    expect(response.body.records[0]._id).toEqual(user2Record1._id);
}

async function testPaginationWhenGetRecords() {
    const response = await TestRecord.find(null, 1, 3, adminToken);
    expect(response.status).toBe(200);
    expect(response.body.records).toHaveLength(3);
    expect(response.body.total).toEqual(4);
    const recordIds = response.body.records.map(record => record._id);
    const expectedRecordIds = [user1Record1, user1Record2, user2Record1].map(record => record._id);
    expect(recordIds).toEqual(expectedRecordIds);

    const response2 = await TestRecord.find(null, 2, 3, adminToken);
    expect(response2.status).toBe(200);
    expect(response2.body.records).toHaveLength(1);
    expect(response2.body.records[0]._id).toEqual(user2Record2._id);
}

describe("GET /records/:id", () => {
    it("Admin can get records for any user", testAdminCanGetRecordById);
    it("Regular user can get own record", testUserCanGetOwnRecordById);
    it("Regular user cannot get record of other user", testUserCannotGetOtherUserRecordById);
    it("Unauthorized user cannot get record", testUnauthorizedUserCannotGetRecordById);
});

async function testAdminCanGetRecordById() {
    const response = await TestRecord.findById(user1Record1._id, adminToken);
    expect(response.status).toBe(200);
    expect(response.body.record._id).toEqual(user1Record1._id);
}

async function testUserCanGetOwnRecordById() {
    const response = await TestRecord.findById(user1Record1._id, regularUser1Token);
    expect(response.status).toBe(200);
    expect(response.body.record._id).toEqual(user1Record1._id);
}

async function testUserCannotGetOtherUserRecordById() {
    const response = await TestRecord.findById(user2Record1._id, regularUser1Token);
    expect(response.status).toBe(401);
}

async function testUnauthorizedUserCannotGetRecordById() {
    const response = await TestRecord.findById(user1Record1._id, null);
    expect(response.status).toBe(401);
}

describe("PUT /records/:id", () => {
    it("Admin can update record for any user", testAdminCanUpdateRecord);
    it("Regular user can update own record", testUserCanUpdateOwnRecord);
    it("Regular user cannot update record of other user", testUserCannotUpdateOtherUserRecord);
    it("Unauthorized user cannot update record", testUnauthorizedUserCannotUpdateOtherUserRecord);
});

async function testAdminCanUpdateRecord() {
    const response = await TestRecord.update(user1Record1._id, {calories: 200}, adminToken);
    expect(response.status).toBe(200);

    const updated = await TestRecord.findById(user1Record1._id, adminToken);
    expect(updated.body.record.calories).toBe(200);
}

async function testUserCanUpdateOwnRecord() {
    const response = await TestRecord.update(user1Record1._id, {calories: 200}, regularUser1Token);
    expect(response.status).toBe(200);

    const updated = await TestRecord.findById(user1Record1._id, regularUser1Token);
    expect(updated.body.record.calories).toBe(200);
}

async function testUserCannotUpdateOtherUserRecord() {
    const response = await TestRecord.update(user2Record1._id, {calories: 200}, regularUser1Token);
    expect(response.status).toBe(401);
}

async function testUnauthorizedUserCannotUpdateOtherUserRecord() {
    const response = await TestRecord.update(user1Record1._id, {calories: 200}, null);
    expect(response.status).toBe(401);
}

describe("DELETE /records/:id", () => {
    it("Admin can delete record for any user", testAdminCanDeleteRecord);
    it("Regular user can delete own record", testUserCanDeleteOwnRecord);
    it("Regular user cannot delete record of other user", testUserCannotDeleteOtherUserRecord);
    it("Unauthorized user cannot delete record", testUnauthorizedUserCannotDeleteOtherUserRecord);
});

async function testAdminCanDeleteRecord() {
    const response = await TestRecord.remove(user1Record1._id, adminToken);
    expect(response.status).toBe(200);

    const deleted = await TestRecord.findById(user1Record1._id, adminToken);
    expect(deleted.status).toBe(404);
}

async function testUserCanDeleteOwnRecord() {
    const response = await TestRecord.remove(user1Record1._id, regularUser1Token);
    expect(response.status).toBe(200);

    const deleted = await TestRecord.findById(user1Record1._id, regularUser1Token);
    expect(deleted.status).toBe(404);
}

async function testUserCannotDeleteOtherUserRecord() {
    const response = await TestRecord.remove(user1Record1._id, regularUser2Token);
    expect(response.status).toBe(401);
}

async function testUnauthorizedUserCannotDeleteOtherUserRecord() {
    const response = await TestRecord.remove(user1Record1._id, null);
    expect(response.status).toBe(401);
}
