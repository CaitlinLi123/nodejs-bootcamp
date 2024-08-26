const AppError = require("../utils/appError");

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const handleCastErrorDB = (err) => {
  //path: which part is wrong
  //value:the value of the wrong part
  const message = `Invalid ${err.path}: ${err.value}`;
  //bad request
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate Field Value: ${value}. Please use another value!   `;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid Input Data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = (err) => {
  new AppError("Invalid token. Please log in again!", 401);
};

const handleJWTExpiredError = (err) => {
  new AppError("Your token has expired! Please log in again!", 401);
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    //operational error
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    //programming error or other unknown error: don't leak error details

    //1)log error
    console.log("ERROR 🤯", err);
    //2)send generic message
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

module.exports = (err, req, res, next) => {
  console.log(err.stack); //stacktrace
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    //MongoDB Error
    let error = { ...err };
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.name === "11000") error = handleDuplicateFieldsDB(error);
    if (error.name === " ValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
    sendErrorProd(error, res);
  }
};
