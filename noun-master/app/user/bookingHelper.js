const DB = require("../../db");
const TAX = require("../constants/constants");

const bookingHelper = (customerKey, customerCarKey, stationKey, stationPortKey, chargingSlotKey, chargeUnit, bookingType, bookingDate, price, totalPrice, totalDiscount, totalTax, grandTotalPrice, notes, res) => {
    let sql = "INSERT INTO booking_details (customerKey, customerCarKey, stationKey, stationPortKey, chargingSlotKey, chargeUnit, bookingType, bookingDate, price, totalPrice, totalDiscount, totalTax, grandTotalPrice, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    try {
        DB.query(sql, [
            customerKey,
            customerCarKey,
            stationKey,
            stationPortKey,
            chargingSlotKey,
            chargeUnit,
            bookingType,
            new Date(bookingDate),
            totalPrice,
            totalPrice,
            totalDiscount,
            totalTax,
            grandTotalPrice,
            notes
        ], async (err, result) => {
            if (err) throw err;
            if (result.insertId) {
                let getDataSql = "select * from booking_details where bookingKey = ?";
                DB.query(getDataSql, [result.insertId],
                    async (err, result) => {
                        if (err) throw err;
                        if (result.length > 0) {
                            return res
                                .status(200)
                                .json({
                                    status: "success",
                                    message: `Booking is successfull`,
                                    data: result[0]
                                });
                        } else {
                            return res
                                .status(400)
                                .json(returnError());
                        }
                    });
            } else {
                return res
                    .status(400)
                    .json(returnError());
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


const returnError = () => {
    return {
        status: "warning",
        message: "booking failed. Please try again."
    }
}

module.exports = {bookingHelper};