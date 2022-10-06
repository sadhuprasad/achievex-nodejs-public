const DB = require("../../db");
const jwt = require("jsonwebtoken");
const jwtKey = "noun-n";
const { json } = require("express/lib/response");

// get all charging ports
exports.getAllChargingPorts = async (req, res) => {
    DB.query("SELECT * FROM charging_ports", async (err, result) => {
        if (err) {
            return res
                .status(200)
                .json({
                    status: "warning",
                    message: `Something went wrong`
                });
        }
        if (result.length > 0) {
            return res
                .status(200)
                .json({
                    status: "success",
                    message: `Found ${result.length} data! Successfull`,
                    data: result
                });
        } else {
            return res
                .status(200)
                .json({
                    status: "warning",
                    message: "Data not found"
                });
        }
    })
}

// get all charging slots
exports.getAllChargingSlots = async (req, res) => {
    DB.query("SELECT * FROM `charging_slots`", async (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            return res
                .status(200)
                .json({
                    status: "success",
                    message: `Found ${result.length} data! Successfull`,
                    data: result
                });
        } else {
            return res
                .status(200)
                .json({
                    status: "warning",
                    message: "Data not found"
                });
        }
    })
}
