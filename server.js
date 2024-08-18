//this file is not related to express codes
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const app = require("./app");
//environment variable to check whether we are at development or production environment
//this is set by express
// console.log(app.get("env"));

//this is set by nodejs
// console.log(process.env);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
