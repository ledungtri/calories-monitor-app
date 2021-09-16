const database = require('./db/database');
const express = require('express');
const app = express();
const authRoute = require('./routes/authRoute');
const userRoute = require('./routes/userRoute');
const recordRoute = require('./routes/recordRoute');
const dotenv = require('dotenv');

function startServer() {
  dotenv.config();

  database.connect().then(() => {
    app.use(express.json());

    app.use("/api/auth", authRoute);
    app.use("/api/users", userRoute);

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Listening in port ${port}...`));
  });
}

startServer();

module.exports = app;