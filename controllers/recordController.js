const recordService = require('../services/recordService');
const { createFilter } = require('odata-v4-mongodb');
const ObjectId = require('mongoose').Types.ObjectId;

async function load(req, res, next, id) {
    if (!ObjectId.isValid(id)) {
        return res.status(400).json({error: "Invalid id"});
    }

    const record = await recordService.findById(id);
    if (!record) {
        return res.status(404).json({error: "Record not found"});
    }
    req.record = record;
    return next();
}

async function create(req, res) {
    try {
        const record = await recordService.create(req.body, req.currentUser);
        return res.status(200).json({record});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
}

async function find(req, res) {
    const filter = createFilter(req.query.filter);

    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const offset = (page - 1) * size;
    const pager = {size, offset};

    if (req.currentUser.role !== 'admin') {
        filter['userId'] = req.currentUser._id;
    }

    const result = await recordService.find(filter, pager);
    return res.status(200).json(result);
}

async function findById(req, res) {
    return res.status(200).json({record: req.record});
}

async function update(req, res) {
    const record = await recordService.update(req.record, req.body);
    return res.status(200).json({record});
}

async function remove(req, res) {
    const record = await recordService.remove(req.record);
    return res.status(200).json({record});
}

module.exports = { load, create, findById, find, update, remove };