process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../../index');

function register(body) {
    return request(app)
        .post('/api/auth/register')
        .send(body);
}

function login(email, password) {
    return request(app)
        .post('/api/auth/login')
        .send({email, password});
}

function create(body, authToken) {
    return request(app)
        .post('/api/users')
        .send(body)
        .set("auth-token", authToken);
}

function find(filter, page, size, authToken) {
    const query = {};
    if (filter) query.filter = filter;
    if (page) query.page = page;
    if (size) query.size = size;

    return request(app).get('/api/users/').query(query).set("auth-token", authToken);
}

function findById(id, authToken) {
    return request(app).get('/api/users/' + id).set("auth-token", authToken);
}

function update(id, body, authToken) {
    return request(app)
        .put('/api/users/' + id)
        .send(body)
        .set("auth-token", authToken);
}

function remove(id, authToken) {
    return request(app)
        .delete('/api/users/' + id)
        .set("auth-token", authToken);
}

module.exports = { register, login, create, find, findById, update, remove };