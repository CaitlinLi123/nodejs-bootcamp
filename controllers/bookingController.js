const catchAsync = require("./../utils/catchAsync");
const AppError = require("../utils/appError");
const Tour = require("./../models/tourModel");
const factory = require("./handlerFactory");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const helmet = require("helmet");

helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'", "https:", "http:", "data:", "ws:"],
    baseUri: ["'self'"],
    fontSrc: ["'self'", "https:", "http:", "data:"],
    scriptSrc: ["'self'", "https:", "http:", "blob:"],
    styleSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
  },
});

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  //2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${req.protocol}://${req.get("host")}/`,
    cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.touId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: ["https://www.natours.dev/img/tours/tour-2-cover.jpg"],
          },
        },
      },
    ],
    mode: "payment",
  });

  //3) Create session as response
  res
    .status(200)
    .set(
      "Content-Security-Policy",
      "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'https://js.stripe.com/v3/' 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .json({ status: "success", session });
});
