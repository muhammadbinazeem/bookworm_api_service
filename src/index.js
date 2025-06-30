import express from "express";
import cors from "cors";
import "dotenv/config";
import job from "./lib/corn.js";

import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';

import { connectDB } from './lib/db.js';

const app = express();
const PORT = process.env.PORT || 3000;

job.start();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

app.get("/health", (req, res) => {
    res.status(200).send("Server is healthy");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});