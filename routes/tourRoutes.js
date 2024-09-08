const express = require("express");
const tourController = require("./../controllers/tourController");
const reviewController = require("./../controllers/reviewController");
const reviewRouter = require("../routes/reviewRoutes");
//params example:/api/v1/tours/:id/:x/:y
//optional parameters (make y optional): /api/v1/:id/:y?

const router = express.Router();
const authController = require("../controllers/authController");

//mounting review router
//tourId will be passed to reviewRouter by using mergeParam
router.use("/:tourId/reviews", reviewRouter);

//param middleware
//the middlewares in the app.js will be executed first, and then execute the middlewares in tourRoutes.js
// router.param("id", tourController.checkID);

router
  .route("/top-5-cheap")
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route("/tour-stats").get(tourController.getTourStats);
router
  .route("/monthly-plan/:year")
  .get(
    authController.protect,
    authController.restrictTo("admin", "lead-guide", "guide"),
    tourController.getMonthlyPlan
  );

router
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(tourController.getToursWithin);

router.route("/distances/:latlng/unit/:unit").get(tourController.getDistances);

router
  .route("/")
  .get(authController.protect, tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.createTour
  );
router
  .route("/:id")
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.deleteTour
  );

//nested routes for review
router
  .route("/:tourId/reviews")
  .post(
    authController.protect,
    authController.restrictTo("user"),
    reviewController.createReview
  );

module.exports = router;
