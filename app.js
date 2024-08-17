const express = require("express");
const fs = require("fs");

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

const app = express();

//middleware
app.use(express.json()); //bodyParser

//self-defined middleware
app.use((req, res, next) => {
  console.log("hello from the middleware🏝️");
  next();
});

const getAllTours = (req, res) => {
  res.status(200).json({
    status: "success",
    data: { tours },
  });
};

//params example:/api/v1/tours/:id/:x/:y
//optional parameters (make y optional): /api/v1/:id/:y?

const getTourById = (req, res) => {
  const tour = tours.find((el) => el.id * 1 === req.params.id);
  if (tour) {
    res.status(200).json({
      status: "success",
      data: { tour },
    });
  } else {
    res.status(404).json({
      status: "fail",
      message: "Invalid ID",
    });
  }
};
const createNewTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  //merge and create a new object: Object.assign
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  //inside the eventloop, cannot block it, thus we need to use asynchronous version of write file
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({ status: "success", data: { tour: newTour } });
    }
  );
};

const updateTour = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);
  if (!tour) {
    res.status(404).json({ status: "fail", message: "Invalid ID" });
  }
  res
    .status(200)
    .json({ status: "success", data: { tour: "updated tour here" } });
};

const deleteTour = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);
  if (!tour) {
    res.status(404).json({ status: "fail", message: "Invalid ID" });
  }
  res
    .status(200)
    .json({ status: "success", data: { tour: "delete the tour." } });
};

//more convenient if we want to change the route
app
  .route("/api/v1/tours/:id")
  .get(getTourById)
  .patch(updateTour)
  .delete(deleteTour);
//IN this case this middleware will not be triggered if the response is sent back from /api/v1/tours/:id because the event loop ends
//the middleware order is app.route(".../:id") , self-defined one and the app.route("/api/v1/tours")
//   app.use((req, res, next) => {
//     console.log("hello from the middleware🏝️");
//     next();
//   });
app.route("/api/v1/tours").get(getAllTours).post(createNewTour);

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
