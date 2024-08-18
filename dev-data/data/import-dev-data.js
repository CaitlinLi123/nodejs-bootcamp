const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const Tour = require("../../models/tourModel");

const DB = process.env.DATABASE_LOCAL;
mongoose.connect(DB).then(() => {
  console.log("MongoDB connection successful!");
});

//READ JSON FILE
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, "utf-8")
);

//IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log("Data successfully loaded!");
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

//DELETE ALL DATA FROM COLLECTION
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log("Data successfully deleted!");
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
