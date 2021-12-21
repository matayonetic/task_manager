// NODE MODULES
const mongoose = require("mongoose");

// LOCAL DATABASE CONNECTION
// mongoose.connect('mongodb://127.0.0.1:27017/task-manager-app');

// REMOTE DATABASE CONNECTION
mongoose.connect(process.env.MONGODB_REMOTE_URL);

