import express from "express";
import connectDB from "./database/db.js";

connectDB();
const app = express();

app.listen(3000, () => console.log("Server running on port 3000"));
