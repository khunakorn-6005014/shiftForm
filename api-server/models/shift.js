import mongoose from 'mongoose';
const shiftSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:       { type: Date,   required: true },
  startTime:  { type: String, required: true },
  endTime:    { type: String, required: true },
  hourlyWage: { type: Number, required: true },
  place: {
    type:    String,
    enum:    ['Office', 'Warehouse', 'Remote'],
    required:true
  },
  slug:       { type: String, required: true, unique: true },
  comments:   { type: String }

}, {
  timestamps: true
});

export default mongoose.model('Shift', shiftSchema);