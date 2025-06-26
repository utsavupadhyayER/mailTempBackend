const connectToMongo = require("./db");
const express = require("express");
const cors = require("cors");
require('dotenv').config()
connectToMongo();

const app = express();
const port = process.env.SERVER_PORT || 5000;

app.use(cors());
app.use(express.json());

// Available Routes

app.use("/api/user", require('./routes/userRoutes'));
app.use("/api/auth", require('./routes/authRoutes'));
app.use("/api/inbox", require('./routes/inboxRoutes'));
app.use("/api/message", require('./routes/messageRoutes'));

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});