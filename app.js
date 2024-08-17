const express = require("express");
const morgan = require("morgan");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

// 1) MIDDLEWARE
app.use(morgan("dev"));
app.use(express.json()); //bodyParser

//self-defined middleware
app.use((req, res, next) => {
  console.log("hello from the middleware🏝️");
  next();
});

// 2) ROUTE HANDLERS

// 3) ROUTES

//Mount the routes
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

// 4) START SERVER
// const port = 3000;
// app.listen(port, () => {
//   console.log(`App running on port ${port}...`);
// });
module.exports = app;
