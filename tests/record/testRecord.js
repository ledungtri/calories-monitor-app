process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../../index');

function create(body, authToken) {
    return request(app)
        .post('/api/records')
        .send(body)
        .set("auth-token", authToken);
}

function find(filter, page, size, authToken) {
    const query = {};
    if (filter) query.filter = filter;
    if (page) query.page = page;
    if (size) query.size = size;

    return request(app).get('/api/records/').query(query).set("auth-token", authToken);
}

function findById(id, authToken) {
    return request(app).get('/api/records/' + id).set("auth-token", authToken);
}

function update(id, body, authToken) {
    return request(app)
        .put('/api/records/' + id)
        .send(body)
        .set("auth-token", authToken);
}

function remove(id, authToken) {
    return request(app)
        .delete('/api/records/' + id)
        .set("auth-token", authToken);
}

module.exports = { create, find, findById, update, remove };