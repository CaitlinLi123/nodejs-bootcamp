const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");
const helmet = require("helmet");
const AppError = require("../utils/appError");

helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'", "https:", "http:", "data:", "ws:"],
    baseUri: ["'self'"],
    fontSrc: ["'self'", "https:", "http:", "data:"],
    scriptSrc: ["'self'", "https:", "http:", "blob:"],
    styleSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
  },
});

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
    .set(
      "Content-Security-Policy",
      "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render("tour", {
      title: `${tour.name}`,
      tour,
    });
});

exports.getLoginForm = (req, res) => {
  res
    .status(200)
    .set(
      "Content-Security-Policy",
      "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render("login", {
      title: "Log into your account",
    });
};

exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: "Your account",
  });
};
