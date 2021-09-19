const mongoose = require('mongoose');

async function connect() {
    if (process.env.NODE_ENV === 'test') {
        const Mockgoose = require('mockgoose').Mockgoose;
        const mockgoose = new Mockgoose(mongoose);
        await mockgoose.prepareStorage();
    }

    await mongoose.connect(
        process.env.DB_CONNECT,
        {useNewUrlParser: true, useUnifiedTopology: true}
    );
    console.log('Connected to MongoDB.');
}

async function clearDatabase() {
    if (process.env.NODE_ENV !== 'test') {
        throw new Error('Attempt to clear non testing database!');
    }

    if (mongoose.connection.db) {
        await mongoose.connection.db.dropDatabase();
        console.log("done clearing database")
    }
}

module.exports = {connect, clearDatabase};