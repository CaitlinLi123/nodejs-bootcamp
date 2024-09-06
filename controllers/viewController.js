const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");

exports.getOverview = catchAsync(async (req, res, next) => {
  //1) Get tour data from collection
  const tours = await Tour.find();
  res.status(200).render("overview", {
    tours,
    title: "All Tours",
  });
});
exports.getTour = catchAsync(async (req, res, next) => {
  //1) Get the data, for the requested tour
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: "review rating user",
  });

  console.log(tour);

  //3) render template
  res.status(200).render("tour", {
    title: "The Forest Hiker Tour",
    tour,
  });
});
