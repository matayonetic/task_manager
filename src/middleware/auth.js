// MODULES
const jwt = require("jsonwebtoken");

// FUNCTIONS & FILES
const User = require("../models/user");

// EXPRESS MIDDLEWARE
const auth = async (req, res, next) => {
  const secret_key = process.env.JWT_SECRET_KEY;
  try {
    // get token and verify it
    const token = req.header("Authorization").replace("Bearer ", "");
    const verifyToken = jwt.verify(token, secret_key);

    // find the user by id and token
    const user = await User.findOne({
      _id: verifyToken._id,
      "tokens.token": token,
    });
    if (!user) {
      throw new Error();
    }
    req.token = token
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ error: "User is not authenticated" });
  }
};

// EXPORTS
module.exports = auth;
