// MODULES
const express = require("express");

// FILES & FUNCTIONS
const Task = require("../models/task");
const auth = require("../middleware/auth");

// ROUTER
const taskRouter = new express.Router();

/*                  TASK ENDPOINTS                    */
// CREATE TASK
taskRouter.post("/tasks/create", auth, async (req, res) => {
  const task = new Task({ ...req.body, owner: req.user._id });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

// READ A TASK
taskRouter.get("/task/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

// READ TASKS
taskRouter.get("/tasks", auth, async (req, res) => {
  const match = {};
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }
  const sort = {};
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split("_");
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  }

  try {
    await req.user.populate({
      path: "userTasks",
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort,
      },
    });
    res.send(req.user.userTasks);
  } catch (error) {
    res.status(500).send(error);
  }
});

// UPDATE A TASK
taskRouter.patch("/task/:id", auth, async (req, res) => {
  // For Unavailable Fields
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const validOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!validOperation) {
    return res.status(400).send({ error: "Update fields are invalid" });
  }

  // Find, Update
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      res.status(404).send();
    }

    updates.forEach((update) => {
      task[update] = req.body[update];
    });
    await task.save();

    res.send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

// DELETE A TASK
taskRouter.delete("/task/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

// EXPORTS
module.exports = taskRouter;
