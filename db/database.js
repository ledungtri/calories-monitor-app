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

function clearDatabase(callback) {
    if (process.env.NODE_ENV !== 'test') {
        throw new Error('Attempt to clear non testing database!');
    }

    const fns = [];

    function createAsyncFn(index) {
        fns.push((done) => {
            mongoose.connection.collections[index].deleteOne(() => {
                done();
            });
        });
    }

    for (const i in mongoose.connection.collections) {
        if (mongoose.connection.collections.hasOwnProperty(i)) {
            createAsyncFn(i);
        }
    }

    async.parallel(fns, () => callback());
}
module.exports = {connect, clearDatabase};