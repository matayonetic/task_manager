// MODULES
const express = require("express");

// FILES & FUNCTIONS
require("./db/mongoose");
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

// APP
const app = express();

// MIDDLEWARE
// app.use((req, res, next)=>{
//   res.status(503).send('Server is under maintainance')
// })

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

// SERVER START
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});