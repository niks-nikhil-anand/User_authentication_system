import express from "express";
import bcrypt from "bcrypt";
import { User } from "../models/userModels.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import connectDB from "../lib/connectDB.js";

const router = express.Router();
dotenv.config();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "email or password is missing",
      });
    }

    console.log("database is Connecting");
    await connectDB();
    console.log("Database is connected");

    // check user is available in DB
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }
    // check isPassword is correct

    const isPasswordCorrect = await bcrypt.compare(password, user?.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        error: "Unauthorize access",
      });
    }

    // create a token using jwt
    const token = jwt.sign(
      { id: user?._id, email: user?.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // save the token in cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "Production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(401)
        .json({ error: "name , email or password is missing" });
    }

    // check user is already exits in the DB

    console.log("database is Connecting");
    await connectDB();
    console.log("Database is connected");

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(200).json({
        error: "User already exists",
      });
    }
    // Hash the password using bcrypt.
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      name,
    });

    newUser.save();

    return res.status(200).json({
      message: "User registered Succesfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({ message: "LogOut successfull" });
});

router.get("/", async (req, res) => {
  try {
    console.log("database is Connecting");
    await connectDB();
    console.log("Database is connected");
    const allUser = await User.find();
    if (allUser) {
      res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json({
      message: "User fetched successfully",
      allUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error " });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, password } = req.body;

    if (!id) {
      return res.status(400).json({
        error: "Id is missing",
      });
    }
    console.log("Database is connecting");
    await connectDB();
    console.log("Database is connected");

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        error: "user not found",
      });
    }

    if (name) {
      user.name = name;
    }

    if (email) {
      user.email = email;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    return res.status(200).json({
      message: "User updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
