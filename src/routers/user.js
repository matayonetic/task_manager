// MODULES
const express = require("express");
const multer = require("multer");
const sharp = require("sharp");

// FILES
const User = require("../models/user");
const auth = require("../middleware/auth");
const { welcomeMail, exitMail } = require("../emails/account");

// ROUTER
const userRouter = new express.Router();

// FILE UPLOADS
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Only images are accepted"));
    }
    cb(undefined, true);
  },
});

/*                  USER ENDPOINTS                    */
// SIGNUP
userRouter.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {    
    await user.save();
    welcomeMail(user.email, user.name)
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });    
  } catch (e) {
    res.status(400).send(e);
  }
});

// LOGIN
userRouter.post("/user/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

// UPLOAD AVATAR
userRouter.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    // req.user.avatar = req.file.buffer;
    await req.user.save();

    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({
      error: error.message,
    });
  }
);

// FETCHING AVATAR
userRouter.get("/users/:id/avatar", async (req, res) => {
  const user = await User.findById(req.params.id);
  try {
    if (!user || !user.avatar) {
      throw new Error("Error fetching user");
    }
    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (e) {
    res.status(400).send(e);
  }
});

// DELETE AVATAR
userRouter.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

// LOGOUT ONE
userRouter.post("/user/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      token.token != req.token;
    });
    await req.user.save();
    res.send("You are logged out");
  } catch (e) {
    res.status(500).send();
  }
});

// LOGOUT ALL
userRouter.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send("You have logged out of all devices");
  } catch (e) {
    res.status(500).send(e);
  }
});

// READ AUTHENTICATED USER PROFILE
userRouter.get("/users/profile", auth, async (req, res) => {
  res.send(req.user);
});

// UPDATE USER
userRouter.patch("/user/update", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "age", "password"];
  const validOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!validOperation) {
    return res.status(400).send({ error: "Update fields are invalid" });
  }

  try {
    updates.forEach((update) => {
      req.user[update] = req.body[update];
    });
    const user = await req.user.save();
    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// DELETE USER
userRouter.delete("/user/delete", auth, async (req, res) => {
  try {
    await req.user.remove();
    exitMail(req.user.email, req.user.name)
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});

// EXPORT
module.exports = userRouter;
