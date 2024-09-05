const Review = require("./../models/reviewModel");

const catchAsync = require("./../utils/catchAsync");
const factory = require("./handlerFactory");

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews = await Review.find(filter);

  res.status(200).json({
    results: reviews.length,
    status: "successs",
    data: { reviews },
  });
});

exports.setTourUserIds = (req, res, next) => {
  //Allow nested routes
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  if (!req.body.user) req.body.user = req.user.id; //get the user from protect middleware
  next();
};

exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
