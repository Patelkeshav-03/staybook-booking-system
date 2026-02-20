const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Add hotel to wishlist
// @route   POST /api/customer/wishlist
// @access  Private/Customer
const addToWishlist = asyncHandler(async (req, res) => {
    const { hotelId } = req.body;
    const user = await User.findById(req.user.id);

    if (user.wishlist.includes(hotelId)) {
        res.status(400);
        throw new Error('Hotel already in wishlist');
    }

    user.wishlist.push(hotelId);
    await user.save();

    res.status(200).json({ message: 'Hotel added to wishlist', wishlist: user.wishlist });
});

// @desc    Remove hotel from wishlist
// @route   DELETE /api/customer/wishlist/:hotelId
// @access  Private/Customer
const removeFromWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    user.wishlist = user.wishlist.filter(
        (id) => id.toString() !== req.params.hotelId
    );
    await user.save();

    res.status(200).json({ message: 'Hotel removed from wishlist', wishlist: user.wishlist });
});

module.exports = {
    addToWishlist,
    removeFromWishlist
};
