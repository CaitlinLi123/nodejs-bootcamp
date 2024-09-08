const userController = require("../controllers/userController.js");
const authController = require("../controllers/authController.js");
const express = require("express");
const multer = require("multer");

//the path to save all the images
const upload = multer({ dest: "public/img/users" });

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);
router.get("/logout", authController.logout);

//for all the routers come after this middleware
router.use(authController.protect);

router.patch("/updateMyPassword", authController.updatePassword);
router.get("/me", userController.getMe, userController.getUser);
//upload a single file, specify the name of the field we want to hold, this middleware will take the file and copy it to the destination
router.patch(
  "/updateMe",
  userController.uploadUserPhoto,
  userController.resizeUploadedPhoto,
  userController.updateMe
);
router.delete("/deleteMe", userController.deleteMe);

router.use(authController.restrictTo("admin"));

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
