const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const APIFeatures = require("../utils/apiFeatures");

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError("No document found with that ID!", 404));
    }

    res.status(204).json({ status: "success", data: null });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return next(new AppError("No document found with that ID!", 404));
    res.status(200).json({ status: "success", data: { data: doc } });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({
      status: "success",
      data: { newDoc },
    });

    //const newTour = new Tour({})
    //newTour.save()
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    //only populate in the query
    const doc = await query;
    //Tour.findOne({_id:req.params.id})

    //only trigger when the id length is the same but different id;
    //if id length is different, then the error comes from catchAsync
    if (!doc) {
      return next(new AppError("No doc found with that ID", 404));
    }
    res.status(200).json({
      status: "success",
      data: { doc },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res) => {
    //to Allow for nested GET reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    //GET THE RESULTS
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;

    //SEND RESPONSE
    res.status(200).json({
      status: "success",
      data: { doc },
    });
  });
