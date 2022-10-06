const express = require("express");
const DB = require("../../db");
const router = express.Router();
const jwt = require("jsonwebtoken");
const jwtKey = "noun-n";

const controller = require("./controller");

router.route("/login").post(controller.userLogin);
router.route("/verify-otp").post(controller.verifyOtp);
router.route("/brand-name").get(controller.brandNameList);
router.route("/car-model/:carBrand").get(controller.carModel);
router.route("/car-sub-model").get(controller.carSubModel);
router.route("/slot-booking-by-date").get(controller.slotBookingByDate);
router.route("/stations").get(controller.getAllStation);
router.route("/car-details").get(verifyToken, controller.getCustomerCarDetails);
router.route("/car-details").post(verifyToken, controller.saveCustomerCarDetails);
router.route("/book/slot").post(verifyToken, controller.bookBySlot);
router.route("/book/charge").post(verifyToken, controller.bookByCharging);
router.route("/book/price").post(verifyToken, controller.bookByPrice);
router.route("/available/slot").post(verifyToken, controller.getAvailableSlot);
router.route("/station/:id").get( controller.getSingleStationDetails);

// verify token
function verifyToken(req, res, next) {
    let token = req.headers['authorization'];
    if (token) {
        token = token.split(' ')[1];
        // console.log(`middleware called`, token);
        jwt.verify(token, jwtKey, (err, data) => {
            if (err) {
                res.send({ result: "please provided valid token" });
            } else {
                // req.jwtUser = data.result[0];
                req.jwtUser = result[0];
                next();
            }
        })
    } else {
        res.send({ result: "please add token with header" });
    }
}
module.exports = router;