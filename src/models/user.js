// MODULES
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const Task = require("./task");

// USER SCHEMA
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      required: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email");
        }
      },
    },
    password: {
      type: String,
      trim: true,
      minLength: 7,
      required: true,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("Enter a different password");
        }
      },
    },
    age: {
      type: Number,
      default: 0,
      required: true,
      validate(value) {
        if (value < 0) {
          throw new Error("Please enter a valid age");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  { timestamps: true }
);

// VIRTUAL PROPERTIES
userSchema.virtual("userTasks", {
  localField: "_id",
  ref: "Task",
  foreignField: "owner",
});

//        MIDDLEWARE
// HASH PASSWORD BEFORE SAVING
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

// DELETE TASKS BEFORE REMOVING USER
userSchema.pre("remove", async function (req, res, next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});

// FIND USING CREDENTIALS
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Please check your credentials");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Please check your credentials");
  }
  return user;
};

// GENERATING AUTH TOKEN
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const secret_key = process.env.JWT_SECRET_KEY;
  const token = await jwt.sign({ _id: user._id.toString() }, secret_key, {
    expiresIn: "2 days",
  });
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

// GET PUBLIC PROFILE
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;
  return userObject;
};

// USER MODEL
const User = mongoose.model("User", userSchema);

// EXPORTS
module.exports = User;
