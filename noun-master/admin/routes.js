const express = require("express");

const router = express.Router();

const jwt = require("jsonwebtoken");
const jwtKey = "noun-n";

const controller = require("./controller");

router.route("/login").post(controller.adminLogin);
router.route("/cars").get(controller.listAllCars);
router.route("/cars").post(verifyAdminToken, controller.addCar);
router.route("/providers").get(controller.providers);
router.route("/provider/:id").get(controller.providerDetails);
router.route("/approval-status/:id").put(controller.approvalStatus);
router.route("/customer-list").get(controller.customerList);
router.route("/ports").post(controller.addPort);
router.route("/customer-cars/:id").get(controller.customerCars);
router.route("/customer-booking-details/:id").get(controller.customerBookingDetails);

// verify access token only for provider
function verifyAdminToken(req, res, next) {
    let token = req.headers['authorization'];
    if (token) {
        token = token.split(' ')[1];
        jwt.verify(token, jwtKey, (err, data) => {
            if (err) {
                res.send({
                    status: "warning",
                    message: "Please provide valid token!"
                });
            } else {
                if (data['userRole'] === "admin") {
                    req.jwtAdmin = data;
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