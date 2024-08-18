const express = require("express");
const tourController = require("./../controllers/tourController");
//params example:/api/v1/tours/:id/:x/:y
//optional parameters (make y optional): /api/v1/:id/:y?

const router = express.Router();

//param middleware
//the middlewares in the app.js will be executed first, and then execute the middlewares in tourRoutes.js
router.param("id", tourController.checkID);

router
  .route("/")
  .get(tourController.getAllTours)
  .post(tourController.checkBody, tourController.createTour);
router
  .route("/:id")
  .get(tourController.getTourById)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
