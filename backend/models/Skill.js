const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Frontend', 'Backend', 'Database', 'Cloud & DevOps', 'AI & Data Science', 'Mobile', 'Soft Skills', 'Other'],
      default: 'Other',
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Skill', skillSchema);
