const mongoose = require('mongoose');

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
        default: 0,
        validate: {
            validator: validateCalories
        }
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

function validateCalories(value) {
    return value > 0;
}

module.exports = mongoose.model('Record', recordSchema);