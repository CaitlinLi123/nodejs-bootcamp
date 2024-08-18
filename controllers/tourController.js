const fs = require("fs");
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

//param middleware, so we have a fourth parameter val
exports.checkID = (req, res, next, val) => {
  if (req.params.id * 1 > tours.length) {
    //if no return, then the loop will execute next() and jump to next middleware and return back other response
    //after return, next() will not be called
    return res.status(404).json({
      status: "fail",
      message: "Invalid ID",
    });
  }
  next();
};

//check the request body if it contains name and price property
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    //400: bad request
    return res.status(400).json({
      status: "fail",
      message: "Missing name or price",
    });
  }
  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: "success",
    data: { tours },
  });
};

//params example:/api/v1/tours/:id/:x/:y
//optional parameters (make y optional): /api/v1/:id/:y?

exports.getTourById = (req, res) => {
  const tour = tours.find((el) => el.id === req.params.id * 1);
  if (tour) {
    res.status(200).json({
      status: "success",
      data: { tour },
    });
  }
};
exports.createTour = (req, res) => {
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

exports.updateTour = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);
  res
    .status(200)
    .json({ status: "success", data: { tour: "updated tour here" } });
};

exports.deleteTour = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);
  res
    .status(200)
    .json({ status: "success", data: { tour: "delete the tour." } });
};
