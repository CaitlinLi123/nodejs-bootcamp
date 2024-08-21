module.exports = (fn) => {
  //return a new function express app is gonna call when the route is reached
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};
