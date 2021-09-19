const Record = require('../models/recordModel');
const nutritionixRequestService = require('../services/nutritionixRequestService');

async function create(body, user) {
    body.userId = user._id;

    if (!body.calories) {
        body.calories = await nutritionixRequestService.getCalories(body.meal);
    }

    let exceededCaloriesPerDay = false;
    if (user.expectedCaloriesPerDay) {
        let todayCalories = body.calories;
        const todayRecords = await Record.find({userId: user._id});
        todayRecords.forEach(record => todayCalories += record.calories);

        if (todayCalories > user.expectedCaloriesPerDay) {
            exceededCaloriesPerDay = true;
        }
    }

    return Record.create({...body, exceededCaloriesPerDay});
}

async function find(filter, pager) {
    const total = await Record.count(filter);
    const records = await Record.find(filter).limit(pager.size).skip(pager.offset);
    return {records, total};
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