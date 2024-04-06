const Booking = require('../models/Booking')
const Company = require('../models/Company')

// @desc    Get a booking 
// @route   GET /api/v1/booking/:id
// @access  Private
exports.getBooking = async (req,res,next) => {
    let booking;
    try {
        booking = await Booking.findById(req.params.id).populate({
            path : "Company",
            select : "name address tel"
        });
        if (!booking) {
            return res.status(400).json({ success : false , message : `No booking with the id of ${req.parms.id}`});
        }
        if (booking.user.toString() !== req.user.id && req.user.role !== "admin"){
            return res.status(401).json({ success : false , message : `User ${req.user.id} is not authorized to view this booking`});
        }
        res.status(200).json({ success : true , data : booking });
    } catch (err) {
        console.log(err)
        res.status(400).json({ success : false });
    }
}

// @desc    Create a booking
// @route   POST /api/v1/companies/:companyId/bookings
// @access  Private
exports.createBooking = async (req,res,next) => {
    try {
        console.log(req.params)
        req.body.company = req.params.companyId;
        const company = await Company.findById(req.params.companyId);
        if (!company) {
            return res.status(400).json({ success : false , message : "Company does not exists"});
        }
        req.body.user = req.params.user.id;

        const existedBookings = await Booking.find({ user : req.user.id });

        if (existedBookings >= 3) {
            return res.status(400).json({ success : false , message : "Cannot create more than 3 bookings"});
        }

        const booking = Booking.create(req.body);
        if (!booking) {
            return res.status(400).json({ success : false , message : "Cannot create booking"});
        }
        res.status(201).json({ success : true , data : booking });
    } catch (err) {
        res.status(400).json({ success : false })
    }
}