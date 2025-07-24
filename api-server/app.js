require('dotenv').config();
const express = require('express');
const connectDB = require('./config.js');
const userRoutes = require('./routes/userRoutes.js');

const app = express();
app.use(express.json());

connectDB();

app.use('/api/user', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
