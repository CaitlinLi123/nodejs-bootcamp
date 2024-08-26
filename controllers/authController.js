const User = require("../models/userModel");
const { promisify } = require("util");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");

const signToken = (id) => {
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  const token = signToken(newUser.__id);
  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1) check if email or password exists
  if (!email || !password) {
    return next(new AppError("Please provide email or password", 400));
  }

  //2) Check if user exists && password correct
  //password by default is not selected, so we add a + in front of the password
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  //3) if everything ok, send the token back
  const token = signToken(user.__id);
  res.status(200).json({
    status: "success",
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  //1)Getting token and check if it exists
  let token;
  if (
    req.headers.authoization &&
    req.headers.authoization.startsWith("Bearer")
  ) {
    //the authorization header format is 'Bearer xxxxxx'
    token = req.headers.authoization.split(" ")[1];
  }

  if (!token) {
    //401: not authorized
    return next(
      new AppError("You are not logged in! Please log in to get access", 401)
    );
  }
  //2)Verificate the token
  //the 3rd argument of the jwt.verify function is a callback function that is executed after the verfication finishes
  //promisify: return a promise
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3)Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError("The user no longer exists.", 401));
  }

  //4)Check if user changed password after jwt was issued
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again!", 401)
    );
  }

  req.user = currentUser;
  //grant access to protected route
  next();
});
