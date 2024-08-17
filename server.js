const app = require("./app");
//this file is not related to express codes

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
