const mongoose = require('mongoose');
const nutritionixRequestService = require('../services/nutritionixRequestService');

const recordSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Types.ObjectId,
      required: true
    },
    meal: {
        type: String,
        required: true
    },
    calories: {
        type: Number,
        required: true,
        default: 0
    },
    exceededCaloriesPerDay: {
        type: Boolean,
        required: true,
        default: false
    },
    datetime: {
        type: Date,
        required: true,
        default: Date.now
    },
});

recordSchema.pre('save', async function (next) {
    const record = this;
    try {
        if (!record.calories) {
            record.calories = await nutritionixRequestService.getCalories(record.meal);
        }
        next();
    } catch (error) {
        return next(error);
    }
});

module.exports = mongoose.model('Record', recordSchema);