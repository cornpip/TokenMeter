const express = require('express');
const roomRoutes = require("./routes/roomRoutes");
const chatRoutes = require("./routes/chatRoutes");
const configRoutes = require("./routes/configRoutes");

const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/chats", chatRoutes);
app.use("/rooms", roomRoutes);
app.use("/configs", configRoutes);

app.listen(4000, () => {
    console.log('Server is running on port 4000');
});