// src/server.js
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import shiftRouter from "./routes/shiftRoutes.js"
dotenv.config();
const app = express();
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser:    true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

app.use(express.json());

app.use(cors());
app.use('/api/shifts', shiftRouter);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server listening on port ${PORT}`)
);
