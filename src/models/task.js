// MODULES
const mongoose = require("mongoose");

// TASK SCHEMA
const taskSchema = new mongoose.Schema({
  description: {
    type: String,
    trim: true,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
}, {timestamps: true});

// TASK MODEL
const Task = mongoose.model("Task", taskSchema);

// EXPORTS
module.exports = Task;
