require('dotenv').config();
const express = require('express');
const connectDB = require('./config.js');
const userRoutes = require('./routes/userRoutes.js');
const commentRoutes = require('./routes/commentRoutes.js')
const shiftRoutes = require('./routes/shiftRoutes.js')

const app = express();
app.use(express.json());

connectDB();

app.use('/api/user', userRoutes);
app.use('/api/comment', commentRoutes);
app.use('/api/shifts', shiftRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
