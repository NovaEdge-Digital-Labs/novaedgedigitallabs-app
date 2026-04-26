const mongoose = require('mongoose');

const companyProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true
    },
    logo: {
        type: String, // Cloudinary URL
        default: ''
    },
    website: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        required: [true, 'Location is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    }
}, { timestamps: true });

module.exports = mongoose.model('CompanyProfile', companyProfileSchema);
