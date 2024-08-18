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

const DB = process.env.DATABASE_LOCAL;
mongoose.connect(DB).then(() => {
  console.log("MongoDB connection successful!");
});

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A tour must have a name!"],
    unique: true,
  },
  rating: { type: Number, default: 4.5 },
  price: { type: Number, required: [true, "A tour must have a price!"] },
});

const Tour = mongoose.model("Tour", tourSchema);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
