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

module.exports = mongoose.model('Record', recordSchema);