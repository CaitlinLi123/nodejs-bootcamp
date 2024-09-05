const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator"); // only validates string
const User = require("./userModel");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name!"],
      unique: true,
      trim: true,
      maxLength: [40, "A tour name must have less or equal than 40 characters"],
      minLength: [10, "A tour name must have more or equal than 10 characters"],
      //the validator does not allow spaces:
      // validator: [validator.isAlpha, "Tour name must only contain characters"],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      //this is only for string:
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either: easy, medium or difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10, // 4.66666 => 4.66 => 47 => 4.7
    },
    ratingsQuantity: { type: Number, default: 0 },
    //   rating: { type: Number, default: 4.5 },
    price: { type: Number, required: [true, "A tour must have a price!"] },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          //this only points to current document on NEW document creation
          return val < this.price; // 100 < 200, true, no error
        },
        message: "Discount price ({VALUE}) should be below regular price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a description"],
    },
    description: { type: String, trim: true },
    //image name
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    //an array of string
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: { type: String, default: "Point", enum: ["Point"] },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//improve read performance by setting index
// tourSchema.index({ price: 1 }); //ascending order
//in MongoDB now only need to scan 3 documents
//compound index:
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: "2dsphere" });

//virtual property: not stored in the db
//cannot be applied to find directly
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

//Virtual populate
tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

//Document middleware: runs before .save() and .create()
//presave hook/ presave middleware
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true }); //point to the current document
  next();
});

tourSchema.pre("save", async function (next) {
  const guidePromises = this.guides.map(async (id) => await User.findById(id));
  this.guides = await Promise.all(guidePromises);
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt",
  });
  next();
});

//query middleware
//any query starts with 'find'
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } }); //point to the query
  next();
});

// tourSchema.post(/^find/, function (next) {
//   // console.log(docs);
//   next();
// });

//aggregation middleware
tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline()); //point to the current aggregation object
  next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
