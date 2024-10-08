//this file is not related to express codes
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const app = require("./app");
//environment variable to check whether we are at development or production environment
//this is set by express
// console.log(app.get("env"));

//this is set by nodejs
// console.log(process.env);

//local db:
// const DB = process.env.DATABASE_LOCAL;

//remote db:
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => {
    console.log("MongoDB connection successful!");
  })
  .catch((err) => console.log("ERROR", err));

process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception! 🤯 Shutting down...");
  //let the server finishes all the pending request and then kill the server
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

//global unhandled rejection error handling i.e. wrong db password
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("Unhandled Rejection! 🤯 Shutting down...");
  //let the server finishes all the pending request and then kill the server
  server.close(() => {
    process.exit(1);
  });
});

//heroku every 24 hours will send this signal and shut down the server
process.on("SIGTERM", () => {
  console.log("👋SIGTERM RECEIVED. Shutting down gracefully.");
  //will handle the unfinished request to the end
  server.close(() => {
    console.log("Process terminated!");
  });
});
