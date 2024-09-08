const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, "A user must have a name"] },
  email: {
    type: String,
    required: [true, "A user must have an email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: { type: String, default: "default.jpg" },
  password: {
    type: String,
    required: [true, "A user must have a password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "A user must have a confirm password!"],
    //this only works on save
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: "The confirm password should be the same as the password",
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre("save", async function (next) {
  //Only run this function is password was actually modified
  if (!this.isModified("password")) return next();

  //Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  //if the password is not modified or we are signing up and create a new user document, we don't need to update the passwordChangeAt
  if (!this.isModified("password") || this.isNew) return next();

  // sometimes the function is executed later than issue the new token to user, and thus will lead to passwordChangeAt later than the token timestamp, fail to log in
  //minus 1 sec to ensure the the passwordChangeAt is always later than modifiy time
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//query middleware
userSchema.pre(/^find/, function (next) {
  //points to the current query
  this.find({ active: { $ne: false } });
  next();
});

//instance method: available to all documents to certain collection

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    //changedTimestamp is more than token issued time, the password is changed after the token is issued
    return JWTTimestamp < changedTimestamp;
  }

  //false means not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
