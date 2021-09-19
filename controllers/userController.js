const userService = require('../services/userService');
const { createFilter } = require('odata-v4-mongodb');
const ObjectId = require('mongoose').Types.ObjectId;

async function load(req, res, next, id) {
    if (!ObjectId.isValid(id)) {
        return res.status(400).json({error: "Invalid id"});
    }

    const user = await userService.findById(id);
    if (!user) {
        return res.status(404).json({error: "User not found"});
    }
    req.user = user;
    return next();
}

async function find(req, res) {
    const filter = createFilter(req.query.filter);

    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const offset = (page - 1) * size;
    const pager = {size, offset};

    const result = await userService.find(filter, pager);
    return res.status(200).json(result);
}

async function findById(req, res) {
    return res.status(200).json({user: req.user});
}

async function update(req, res) {
    const user = await userService.update(req.user, req.body);
    return res.status(200).json({user});
}

async function remove(req, res) {
    const user = await userService.remove(req.user);
    return res.status(200).json({user});
}

module.exports = { load, findById, find, update, remove };