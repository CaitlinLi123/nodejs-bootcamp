const { Mongoose, default: mongoose, mongo } = require("mongoose");
const Tour = require("./tourModel");

//review / rating/ created At/ ref to tour/ ref to user
const reviewSchema = new mongoose.Schema(
  {
    review: { type: String, required: [true, "Review cannot be empty"] },
    rating: { type: Number, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a tour"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user!"],
    },
  },
  //   By default, Mongoose does not include virtuals when you convert a document to JSON.
  //   For example, if you pass a document to Express' res.json() function, virtuals will not be included by default.
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

reviewSchema.pre(/^find/, function (next) {
  this
    // .populate({
    //   path: "tour",
    //   select: "name",
    // })
    .populate({
      path: "user",
      select: "name photo",
    });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  //aggregate only works on model
  //this point to model
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[[0].avgRating],
    });
  } else {
    //when there are no matching, stats can be empty array
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post("save", function () {
  //this points to current review
  //Review.calcAverageRatings : Review haven't been defined
  //this.constructor points to the model that creates the document
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  //this point to current query
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOnAnd/, async function () {
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;

//POST /tour/
