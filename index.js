import express from "express";
import userRoutes from "./routes/userRoutes.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 8000;

app.use(express.json());

app.use("/user", userRoutes);

app.get("/", (req, res) => {
  res.send("Nikhil is testing");
});

app.listen(PORT, () => {
  console.log(`Server is listeing on port ${PORT}`);
});
