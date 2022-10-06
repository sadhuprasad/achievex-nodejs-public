const express = require("express");
const DB = require("../../db");

const router = express.Router();

const jwt = require("jsonwebtoken");
const jwtKey = "noun-n";

const controller = require("./controller");
// const multer = require("multer");
// const upload = multer({ dest: 'uploads/' })

// service provider apis
router.route("/login").post(controller.serviceProviderAndStationLogin);
router.route("/verify-otp").post(controller.verifyOtp);
router.route("/profile-status").get(verifyProviderToken, controller.profileStatus);
router.route("/provider/details-upload").post(verifyProviderToken, controller.serviceProviderDocumentsUpload);
router.route("/provider/details").get(verifyProviderToken, controller.getProviderDetails);
router.route("/provider/add-station").post(verifyProviderToken, controller.addStation);
router.route("/provider/stations").get(verifyProviderToken, controller.getAllStationDetails);
router.route("/provider/station/:id").get(verifyProviderToken, controller.getSingleStationDetails);

// station apis
router.route("/station-details").get(verifyToken, controller.stationDetails);
router.route("/ports").post(verifyToken, controller.addStationPort);
router.route("/ports").get(verifyToken, controller.getStationPorts);
router.route("/booking").get(verifyToken, controller.bookingList);
router.route("/booking/:id").get(verifyToken, controller.bookingDetails);
router.route("/available/slot").post(verifyToken, controller.getAvailableSlot);

// ⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵
// ⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵⫵⫲⫵

// verify access token for provider & station
function verifyToken(req, res, next) {
    let token = req.headers['authorization'];
    if (token) {
        token = token.split(' ')[1];
        // console.log(`middleware called`, token);
        console.log('asdfsdfsdf');
        jwt.verify(token, jwtKey, (err, data) => {
            console.log('asuhg');
            if (err) {
                console.log(err );
                res.send({
                    status: "warning",
                    message: "Please provide valid token!"
                });
            } else {
                console.log(data);
                if (data['userRole'] == "provider" || data['userRole'] == "station" || data['userRole'] == "admin") {
                    req.jwtUser = data;
                    next();
                } else {
                    res.send({
                        status: "warning",
                        message: "Please provide valid token!"
                    });
                }
            }
        })
    } else {
        res.send({
            status: "warning",
            message: "Please provide token!"
        });
    }
}

// verify access token only for provider
function verifyProviderToken(req, res, next) {
    let token = req.headers['authorization'];
    if (token) {
        token = token.split(' ')[1];
        console.log(`middleware called`, token);
        jwt.verify(token, jwtKey, (err, data) => {
            if (err) {
                res.send({
                    status: "warning",
                    message: "Please provide valid token!"
                });
            } else {
                if (data['userRole'] == "provider") {
                    req.jwtUser = data;
                    next();
                } else {
                    res.send({
                        status: "warning",
                        message: "Please provide valid token!"
                    });
                }
            }
        })
    } else {
        res.send({
            status: "warning",
            message: "Please provide token!"
        });
    }
}

module.exports = router;