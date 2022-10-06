const express = require("express");
const DB = require("../../db");

const router = express.Router();

const jwt = require("jsonwebtoken");
const jwtKey = "noun-n";

const controller = require("./controller");


// common apis
router.route("/charging-ports").get(controller.getAllChargingPorts);
router.route("/charging-slots").get(controller.getAllChargingSlots);


module.exports = router;