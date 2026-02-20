const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please add a hotel name'],
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description can not be more than 500 characters']
    },
    amenities: {
        type: [String],
        required: false
    },
    imageUrls: {
        type: [String],
        required: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Hotel', HotelSchema);
