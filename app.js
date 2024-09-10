const express = require("express");
const morgan = require("morgan");
const path = require("path");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const bookingRouter = require("./routes/bookingRoutes");
const bookingController = require("./controllers/bookingController");
const viewRouter = require("./routes/viewRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

//heroku acts as a proxy, which redirects and modifies the incoming request
app.enable("trust proxy");

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Serving static files
app.use(express.static(path.join(__dirname, "public"))); //serve static file

// 1) GLOBAL MIDDLEWARE

//Implement CORS
app.use(cors());
//Access-Control-Allow-Origin *

//api: api.natours.com frontend natours.com
//app.use(cors({origin:"https://www.natours.com"}))

// used to request information about the communication options available for the target resource.
app.options("*", cors());

// Set security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "script-src": [
          "'self'",
          "https://cdnjs.cloudflare.com",
          "https://api.mapbox.com",
          "https://js.stripe.com",
        ],
        // Add any other directives you may need for styles, fonts, etc.
      },
    },
  })
);

// Developmet logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour.",
});
app.use("/api", limiter);

//stripe needs a raw string body, not a json format. So this is put above the body parser middleware
app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  bookingController.webhookCheckout
);

// Body parser, reading data from body into req.body
//set limit to the data size sent to server
app.use(express.json({ limit: "10kb" }));
//get form data
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
// allow the fields in the whitelist to be duplicated
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

app.use(compression());

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "script-src 'self' https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com blob:;"
  );
  next();
});

// 2) ROUTES

//Mount the routes
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/booking", bookingRouter);
app.use("/", viewRouter);

//for all the http methods:
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
