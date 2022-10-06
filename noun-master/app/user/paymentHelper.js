const DB = require("../../db");
const TAX = require("../constants/constants");
var crypto = require("crypto");
const Razorpay = require('razorpay');

const razorpay_key_id = 'rzp_test_f9glal1YwwrisU';
const razorpay_key_secret = 'W9dp3QXGLSr2wsjBQbwWdFft';

const initRazorpay = () => {
    return new Razorpay({
        key_id: razorpay_key_id,
        key_secret: razorpay_key_secret
    });
}



const getBookingDetails = async (bookingId, res) => {
    let bookingSql = "select * from booking_details where bookingKey = ?";
    try {
        return DB.query(bookingSql, [
            bookingId
        ], async (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
                return res
                    .status(200)
                    .json({
                        status: "success",
                        message: `Booking data found`,
                        data: result[0]
                    });
            } else {
                return res
                    .status(400)
                    .json(returnError('booking not found. Please try again.'));
            }
        });
    } catch (err) {
        console.log(err);
        return res
            .status(400)
            .json({
                status: "warning",
                message: "Data formats are not correct."
            });
    }
}

const createPaymentOder = async (bookingId, customerId, res) => {
    var instance = initRazorpay();
    let bookingSql = "select * from booking_details where bookingKey = ?";
    try {
        return DB.query(bookingSql, [
            bookingId
        ], async (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
                const bookingDetails = result[0];
    var options = {
        amount: Math.floor(bookingDetails.grandTotalPrice * 100),  // amount in the smallest currency unit
        currency: "INR",
        receipt: `order_rcptid_${bookingDetails.bookingKey}`
    };
    instance.orders.create(options, function (err, order) {
        if (err) {
            console.log('payment error', err);
            throw err;
        }
        console.log(order);
            let paymentSql = "INSERT INTO payments (`bookingKey`, `customerKey`, `tnxId`, `amount`, `currency`, `status`) VALUES (?, ?, ?, ?, ?, ?)";
            try {
                DB.query(paymentSql, [
                    bookingId,
                    customerId,
                    order.id,
                    bookingDetails.grandTotalPrice,
                    'INR',
                    'pending'
                ], async (err, result) => {
                    if (err) throw err;
                    if (result.insertId) {
                        const getPaymentsql = 'SELECT * FROM payments WHERE paymentKey = ?'
                        DB.query(getPaymentsql, [result.insertId],
                            async (err, result) => {
                                if (err) throw err;
                                if (result.length > 0) {
                                    return res
                                        .status(200)
                                        .json({
                                            status: "success",
                                            message: `Payment create is successfull`,
                                            data: { ...result[0], order }
                                        });
                                } else {
                                    return res
                                        .status(400)
                                        .json(returnError('Payment creation failed. Please try again.'));
                                }
                            });
                    }
                    else {
                        return res
                            .status(400)
                            .json(returnError('Payment creation failed. Please try again.'));
                    }
                });
            } catch (err) {
                console.log(err);
                return res
                    .status(400)
                    .json({
                        status: "warning",
                        message: "Payment creation failed. Please try again.",
                        err
                    });
            }
    });
            } else {
                return res
                    .status(400)
                    .json(returnError('booking not found. Please try again.'));
            }
        });
    } catch (err) {
        console.log(err);
        return res
            .status(400)
            .json({
                status: "warning",
                message: "Data formats are not correct."
            });
        }
}

const verifyPaymentOrder = async (razorpay_payment_id, razorpay_order_id, razorpay_signature, paymentMode, paymentId) => {
    let body = razorpay_order_id + "|" + razorpay_payment_id;

    var expectedSignature = crypto.createHmac('sha256', razorpay_key_secret)
        .update(body.toString())
        .digest('hex');
    console.log("sig received ", razorpay_signature);
    console.log("sig generated ", expectedSignature);
    if (expectedSignature === razorpay_signature) {
        DB.query(`UPDATE payments SET paymentMode=?, status=? WHERE paymentKey = ?`, [paymentMode, 'paymentMode', paymentId],
            async (err, result) => {
                if (err) throw err;
                if (result.length > 0) {
                    return res
                        .status(200)
                        .json({
                            status: "success",
                            message: `Payment is complete.`,
                            data: result[0]
                        });
                } else {
                    return res
                        .status(400)
                        .json(returnError('Payment failed.'));
                }
            });
    } else {
        DB.query(`UPDATE payments SET paymentMode=?, status=? WHERE paymentKey = ?`, [paymentMode, 'failed', paymentId],
            async (err, result) => {
                if (err) throw err;
                if (result.length > 0) {
                    return res
                        .status(400)
                        .json({
                            status: "warning",
                            message: `Payment failed.`,
                            data: result[0]
                        });
                } else {
                    return res
                        .status(400)
                        .json(returnError('Payment failed.'));
                }
            });
    }
}


const returnError = (msg) => {
    return {
        status: "warning",
        message: msg
    }
}

module.exports = { createPaymentOder, getBookingDetails, verifyPaymentOrder };