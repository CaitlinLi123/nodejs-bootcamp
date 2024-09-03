const { Mongoose, default: mongoose, mongo } = require("mongoose");

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
  this.populate({
    path: "tour",
    select: "name",
  }).populate({
    path: "user",
    select: "name photo",
  });
  next();
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
