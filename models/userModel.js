const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['regular', 'manager', 'admin'],
        default: 'regular'
    },
    expectedCaloriesPerDay: {
        type: Number,
        required: false
    }
});

userSchema.pre('save', function (next) {
    const user = this;
    try {
        user.password = bcrypt.hashSync(user.password, 8);
        next();
    } catch (error) {
        return next(error);
    }
});

userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
}

userSchema.methods.comparePassword = function (toCompare) {
    return bcrypt.compareSync(toCompare, this.password);
};

module.exports = mongoose.model('User', userSchema);