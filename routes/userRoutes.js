import express from "express";
import bcrypt from "bcrypt";
import userModels from "../models/userModels";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const router = express.Router();
dotenv.config();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email or password is missing" });
    }

    // check for the user is avavibale is in DB
    const user = await userModels.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // compare the password

    const isPasswordMatch = await bcrypt.compare(password, user?.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ error: "Password is incorrect" });
    }

    // create a jwt token
    const token = jwt.sign(
      { id: user?._id, email: user?.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // save in the ccokies

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV == "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successfull",
      user: { id: user?._id, email: user.email },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if ((!email || !name, !password)) {
      return res
        .status(400)
        .json({ error: "name , email or password is missing" });
    }

    // check user already exists

    const existingUser = await userModels.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    // hash the password using bcrypt

    const hassedPassword = await bcrypt.hash(password, 10);

    if (!hassedPassword) {
      return res.status(400).json({ error: "Password cannot able to hash" });
    }

    // Create a new User

    const newUser = new userModels({
      name,
      email,
      password: hassedPassword,
    });

    await newUser.save();

    return res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
