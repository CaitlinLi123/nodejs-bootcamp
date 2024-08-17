const express = require("express");
const fs = require("fs");

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

const app = express();
app.get("/api/v1/tours", (req, res) => {
  res.status(200).json({
    status: "success",
    data: { tours },
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
