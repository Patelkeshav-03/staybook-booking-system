const mongoose = require('mongoose');

const StatusLogSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    previousStatus: {
        type: String
    },
    newStatus: {
        type: String,
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Who made the change (admin, vendor, customer, system)
        required: false
    },
    reason: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('StatusLog', StatusLogSchema);
