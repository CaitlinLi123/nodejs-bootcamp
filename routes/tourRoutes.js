const express = require("express");
const tourController = require("./../controllers/tourController");
//params example:/api/v1/tours/:id/:x/:y
//optional parameters (make y optional): /api/v1/:id/:y?

const router = express.Router();
router
  .route("/")
  .get(tourController.getAllTours)
  .post(tourController.createNewTour);
router
  .route("/:id")
  .get(tourController.getTourById)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
