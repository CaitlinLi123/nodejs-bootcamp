const fs = require("fs");
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

const Tour = require("./../models/tourModel");
const { query } = require("express");

//param middleware, so we have a fourth parameter val

//check the request body if it contains name and price property

exports.getAllTours = async (req, res) => {
  try {
    //QUERY
    //a new object contains every key value pairs
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    //clean the query first and then execute the query because we use await so only result can be sent back and impossible to sort or pagination again
    excludedFields.forEach((el) => delete queryObj[el]);
    //this return a query
    const query = Tour.find(queryObj);
    const tours = await query;

    //SEND RESPONSE
    res.status(200).json({
      status: "success",
      data: { tours },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};

//params example:/api/v1/tours/:id/:x/:y
//optional parameters (make y optional): /api/v1/:id/:y?

exports.getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    //Tour.findOne({_id:req.params.id})
    if (tour) {
      res.status(200).json({
        status: "success",
        data: { tour },
      });
    }
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};
exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: "success",
      data: { newTour },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
  //const newTour = new Tour({})
  //newTour.save()
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ status: "success", data: { tour } });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: "success", data: null });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};
