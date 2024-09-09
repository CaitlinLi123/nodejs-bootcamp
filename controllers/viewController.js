const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");
const catchAsync = require("../utils/catchAsync");
const helmet = require("helmet");
const AppError = require("../utils/appError");
const User = require("../models/userModel");

// helmet.contentSecurityPolicy({
//   directives: {
//     defaultSrc: ["'self'", "https:", "http:", "data:", "ws:"],
//     baseUri: ["'self'"],
//     fontSrc: ["'self'", "https:", "http:", "data:"],
//     scriptSrc: ["'self'", "https:", "http:", "blob:"],
//     styleSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
//   },
// });

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

  if (!tour) {
    return next(new AppError("There is no tour with that name.", 404));
  }

  //3) render template
  res
    .status(200)
    // .set(
    //   "Content-Security-Policy",
    //   "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'https://js.stripe.com/v3/' 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    // )
    .render("tour", {
      title: `${tour.name}`,
      tour,
    });
});

exports.getLoginForm = (req, res) => {
  res
    .status(200)
    // .set(
    //   "Content-Security-Policy",
    //   "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'https://js.stripe.com/v3/' 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    // )
    .render("login", {
      title: "Log into your account",
    });
};

exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: "Your account",
  });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  //if we don't pass in user, then the user is the user in the protect middleware
  res.status(200).render("account", {
    title: "Your account",
    user: updatedUser,
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  //1) Find all bookings
  const userId = req.user.id;
  const bookings = await Booking.find({ user: userId });

  //2) Find tours with the returned IDs
  console.log(bookings);
  const tourIDs = bookings.map((booking) => booking.tour._id);
  console.log(tourIDs);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render("overview", { title: "My Tours", tours });
});
