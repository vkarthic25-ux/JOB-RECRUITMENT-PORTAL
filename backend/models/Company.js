const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide company name'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    industry: {
      type: String,
      default: 'Technology',
    },
    location: {
      type: String,
      default: '',
    },
    logo: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Company', companySchema);
