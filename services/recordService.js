const Record = require('../models/recordModel');

async function create(body, user) {
    body.userId = user._id;

    let exceededCaloriesPerDay = false;
    if (user.expectedCaloriesPerDay) {
        const todayCalories = Record.find({userId: user._id});
        if (todayCalories > user.expectedCaloriesPerDay) {
            exceededCaloriesPerDay = true;
        }
    }

    return Record.create({...body, exceededCaloriesPerDay});
}

async function find(filter, pager) {
    const total = await Record.count(filter);
    const users = await Record.find(filter).limit(pager.size).skip(pager.offset);
    return {users, total};
}

async function findById(id) {
    return Record.findById(id);
}

async function update(record, body) {
    await record.update(body);
    return findById(record.id);
}

function remove(record) {
    return record.remove();
}

module.exports = { create, find, findById, update, remove };