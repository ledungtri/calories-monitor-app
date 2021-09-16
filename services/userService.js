const User = require('../models/userModel');

async function create(body) {
    const existed = await User.findOne({ email: body.email });
    if (existed) {
        throw new Error("Email already exists.");
    }
    return User.create(body);
}

async function find(filter, pager) {
    const total = await User.count(filter);
    const users = await User.find(filter).limit(pager.size).skip(pager.offset);
    return {users, total};
}

function findById(id) {
    return User.findById(id);
}

async function update(user, body) {
    await user.update(body);
    return findById(user.id);
}

function remove(user) {
    return user.remove();
}

module.exports = { create, find, findById, update, remove };