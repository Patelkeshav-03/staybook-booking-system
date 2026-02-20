const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    storeName: {
        type: String,
        required: [true, 'Please add a store name']
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    taxId: {
        type: String,
        required: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Vendor', VendorSchema);
