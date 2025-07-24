// src/server.js
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import shiftRouter from "./routes/shiftRoutes.js"
dotenv.config();
const DB_URL = process.env.MONGO_URI;
const app = express();
mongoose.connect(DB_URL, {useNewUrlParser: true,useUnifiedTopology: true})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("MongoDB Connection Error:", err));

app.use(express.json());

app.use(cors());
app.use('/api/shifts', shiftRouter);
const PORT = process.env.PORT;
console.log("port:",PORT)
app.listen(PORT, () =>
  console.log(`Server listening on port ${PORT}`)
);
