const DB = require("../../db");
const jwt = require("jsonwebtoken");
const jwtKey = "noun-n";
const TAX = require("../constants/constants");
const { bookingHelper } = require("./helper");

exports.userLogin = async (req, res) => {
    let phone = req.body.phone;
    let OTP = Math.floor(1000 + Math.random() * 9000);
    let otpDura = 600000;
    let currentTimeMillis = new Date().getTime();
    let otpExpiredAt = currentTimeMillis + otpDura;
    if (!phone || phone.toString().length < 10) {
        return res.status(400).json({ message: "Phone number is required." });
    }
    const checkUser = DB.getConnection(async (err, connection) => {
        connection.release();
        if (err) {
            return res.status(400).json({ err });
        } else {
            let sql = "SELECT id, name, email, role FROM users WHERE phone = ? ";
            var test = DB.query(sql, [phone], async (err, result) => {
                if (err) {
                    return res.status(400).json({ err });
                }
                jwt.sign({ result }, jwtKey, { expiresIn: "2h" }, (err, token) => {
                    if (err) {
                        console.log(`err ccc`);
                    }
                    console.log(`Token: ${token}`);

                    if (err) throw err;
                    console.log(result);
                    if (result.length == 1) {
                        result.map((e) => {
                            console.log(`Your ID is ${e.id}`);
                            let id = e.id;
                            DB.query(`UPDATE users SET otp=?, otpExpiredAt=? WHERE id=?`, [OTP, otpExpiredAt, id])
                        })

                        console.log(`Your OTP is ${OTP}`);
                        return res
                            .status(202)
                            .json({
                                status: "success",
                                message: "Phone number already registered",
                                otp: `${OTP}`,
                            });
                    } else {
                        let phone = req.body.phone;
                        let role = "customer";
                        let otp = OTP;
                        let created_at = new Date();
                        let updated_at = new Date();

                        let sql =
                            "INSERT INTO users (phone, otp, otpExpiredAt, createdAt, updatedAt, role) VALUES (?,?,?,?,?,?)";
                        DB.query(
                            sql,
                            [
                                phone,
                                otp,
                                otpExpiredAt,
                                created_at,
                                updated_at,
                                role,
                            ],
                        )
                        console.log(`This ${phone} number not registered in our database`);
                        console.log(`Your OTP is ${OTP}`);
                        return res
                            .status(201)
                            .json({
                                status: "success",
                                message: `This ${phone} number registered in our database`,
                                otp: `${OTP}`
                            });
                    }
                })
            });
        }
    })
}

// verifyOtp
exports.verifyOtp = async (req, res) => {
    let phone = req.body.phone;
    let otp = req.body.otp;
    const checkUser = DB.getConnection(async (err, connection) => {
        connection.release();
        if (err) {
            return res.status(400).json({ err });
        } else {
            let sql = "SELECT * FROM users WHERE phone = ? && otp= ?";
            var test = DB.query(sql, [phone, otp], async (err, result) => {
                if (err) {
                    return res.status(400).json({ err });
                }
                // let data = result[0];
                jwt.sign({ result }, jwtKey, { expiresIn: "2h" }, (err, token) => {
                    if (err) {
                        console.log(`err ccc`);
                    }
                    console.log(`Token: ${token}`);

                    if (err) throw err;
                    console.log(result);
                    if (result.length == 1) {
                        result.map((e) => {
                            console.log(`Your ID is ${e.id}`);
                        })
                        console.log(`OTP matched`);
                        console.log(req.cookies);

                        return res
                            .status(202)
                            .cookie("userData", result, "2d")
                            .json({
                                status: "success",
                                message: "OTP matched",
                                token: token
                                // serviceProviderData: req.cookies,
                            })
                    } else {
                        console.log(`Otp dos't matched`);
                        return res
                            .status(201)
                            .cookie("userData", result, "2d")
                            .json({
                                status: "warning",
                                message: `Otp dos't matched`,
                                userData: result,
                                sql: test.sql
                                // serviceProviderData: req.cookies,
                            });
                    }
                })
            });
        }
    })
}

// brandNameList
exports.brandNameList = async (req, res) => {

    DB.getConnection(async (err, connection) => {
        connection.release();
        if (err) {
            return res.status(400).json({ err });
        } else {
            let sql = `SELECT carKey,carBrand,createdAt,updatedAt,status FROM car_details WHERE status='active' GROUP BY carBrand`;
            DB.query(sql, async (err, result) => {
                if (err) {
                    return res.status(400).json({ err });
                }
                if (err) throw err;
                console.log(result);
                if (result.length > 0) {
                    result.map((e) => {
                        console.log(`Data found`);
                    })

                    return res
                        .status(202)
                        .json({
                            status: "success",
                            message: "Data found",
                            data: result
                        })
                } else {
                    return res
                        .status(201)
                        .json({
                            status: "warning",
                            message: `Data not found`,
                            data: [],
                        });
                }
            });
        }
    })
}

// brandNameList
exports.carModel = async (req, res) => {

    DB.getConnection(async (err, connection) => {
        connection.release();
        if (err) {
            return res.status(400).json({ err });
        } else {
            let carBrand = req.params.carBrand;
            let sql = `SELECT carKey,carModel,createdAt,updatedAt,status FROM car_details WHERE status='active' AND carBrand='${carBrand}' GROUP BY carModel`;
            DB.query(sql, async (err, result) => {
                if (err) {
                    return res.status(400).json({ err });
                }
                if (err) throw err;
                console.log(result);
                if (result.length > 0) {
                    result.map((e) => {
                        console.log(`Data found`);
                    })

                    return res
                        .status(202)
                        .json({
                            status: "success",
                            message: "Data found",
                            data: result,
                        })
                } else {
                    return res
                        .status(201)
                        .json({
                            status: "warning",
                            message: `Data not found`,
                            data: []
                        });
                }
            });
        }
    })
}

// carSubModel
exports.carSubModel = async (req, res) => {

    const checkUser = DB.getConnection(async (err, connection) => {
        connection.release();
        if (err) {
            return res.status(400).json({ err });
        } else {
            let carBrand = req.query.carBrand;
            let carModel = req.query.carModel;
            let sql = `SELECT car_details.carKey, car_details.carSubModel, CONCAT('https://noun.achievextesting.one/storage/docs/', car_details.carImage) AS carImage, car_details.createdAt, car_details.updatedAt, car_details.status, charging_ports.portName, charging_ports.portType FROM car_details, charging_ports  WHERE car_details.status='active' AND car_details.carBrand='${carBrand}' AND car_details.carModel='${carModel}' AND car_details.chargingPortKey=charging_ports.portKey GROUP BY car_details.carSubModel`;
            var test = DB.query(sql, async (err, result) => {
                if (err) {
                    return res.status(400).json({ err });
                }
                if (err) throw err;
                console.log(result);
                if (result.length > 0) {
                    result.map((e) => {
                        console.log(`Data found`);
                    })

                    return res
                        .status(202)
                        .json({
                            status: "success",
                            message: "Data found",
                            data: result
                        })
                } else {
                    return res
                        .status(201)
                        .json({
                            status: "warning",
                            message: `Data not found`,
                            data: [],
                        });
                }
            });
        }
    })
}

// slotBookingByDate
exports.slotBookingByDate = async (req, res) => {

    const checkUser = DB.getConnection(async (err, connection) => {
        connection.release();
        if (err) {
            return res.status(400).json({ err });
        } else {
            let stationKey = req.query.stationKey;
            let bookingDate = req.query.bookingDate;
            let isBooking = `SELECT * FROM booking WHERE stationKey='1' AND bookingDate='2022-06-23'`;
            // let isBooking = `SELECT * FROM booking WHERE stationKey='${stationKey}' AND bookingDate='${bookingDate}'`;
            DB.query(isBooking, async (err, result) => {
                if (err) {
                    return res.status(400).json({ err });
                }
                if (err) throw err;
                if (result.length > 0) {
                    result.map((sl) => {
                        console.log(sl['slotKey']);

                        // ********************************
                        let sql = `SELECT * FROM slot`;
                        var test = DB.query(sql, async (err, result) => {
                            if (err) {
                                return res.status(400).json({ err });
                            }
                            if (err) throw err;
                            // console.log(result[0]['slotNo']);
                            if (result.length > 0) {
                                result.map((e) => {
                                    console.log(e['slotKey']);
                                    if (e['slotKey'] === sl['slotKey']) {
                                        console.log('slot match');
                                    } else {
                                        console.log('slot not match');
                                    }
                                })

                                return res
                                    .status(202)
                                    .json({
                                        status: "success",
                                        message: "Data found",
                                        data: result,
                                    })
                            } else {
                                return res
                                    .status(201)
                                    .json({
                                        status: "warning",
                                        message: `Data not found`,
                                        data: [],
                                    });
                            }
                        });
                        // ********************************
                        return res
                            .status(202)
                            .json({
                                status: "success",
                                message: "Data found",
                                data: result,
                            })
                    })
                } else {
                    return res
                        .status(201)
                        .json({
                            status: "warning",
                            message: `Data not found`,
                            data: [],
                        });
                }
            });
        }
    })
}

// get all station
exports.getAllStation = async (req, res) => {
    let sql = "SELECT * FROM service_stations WHERE status = 'active' and serviceStatus='open'";
    var test = DB.query(sql, async (err, result) => {
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
                .status(400)
                .json({
                    status: "warning",
                    message: "Data not found"
                });
        }
    })
}

// save customer car details
exports.saveCustomerCarDetails = async (req, res) => {
    const customerKey = req.jwtUser['id'];
    const { carKey, defaultCar } = req.body;

    let sql = "insert into customer_cars (customerKey, carKey, defaultCar) VALUES (?,?,?)";

    DB.query(sql, [customerKey, carKey, defaultCar], async (err, result) => {
        if (err) throw err;
        if (result.insertId) {
            return res
                .status(200)
                .json({
                    status: "success",
                    message: `Car data saved successfully`,
                });
        } else {
            return res
                .status(400)
                .json({
                    status: "warning",
                    message: "Car data not saved successfully"
                });
        }
    })
}

// get customer car details
exports.getCustomerCarDetails = async (req, res) => {
    const customerKey = req.jwtUser['id'];

    let sql = "SELECT * FROM customer_cars inner join car_details on customer_cars.carKey = car_details.carKey WHERE customer_cars.customerKey = ?";

    var test = DB.query(sql, [customerKey], async (err, result) => {
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
                .status(400)
                .json({
                    status: "warning",
                    message: "Data not found",
                    sql: test.sql
                });
        }
    })
}

// book by slot
/**
 * 
 * @param {*} req {
 * stationId, stationPortId, charging slot key,
 * booking date
 * }
 * @param {*} res 
 */
exports.bookBySlot = async (req, res) => {
    const customerKey = req.jwtUser['id'];
    const { stationKey, stationPortKey, chargingSlotKey, bookingDate, customerCarKey } = req.body;
    const unitPerMinute = 3;
    const unitPerPrice = 2;
    const totalUnit = (chargingSlotKey.split(",").length * 15) * unitPerMinute;
    const totalPrice = totalUnit * unitPerPrice;
    const totalDiscount = 0;
    const totalTax = (totalPrice - totalDiscount) * TAX;
    const grandTotalPrice = (totalPrice - totalDiscount) + totalTax;
    const notes = "";
    return await bookingHelper(customerKey,
        customerCarKey,
        stationKey,
        stationPortKey,
        chargingSlotKey,
        totalUnit,
        'slot',
        new Date(bookingDate),
        totalPrice,
        totalPrice,
        totalDiscount,
        totalTax,
        grandTotalPrice,
        notes, res);
}

// book by charging
/**
 * 
 * @param {*} req {
 * stationId, stationPortId, charging slot key,
 * booking date
 * }
 * @param {*} res 
 */
exports.bookByCharging = async (req, res) => {
    const customerKey = req.jwtUser['id'];
    const { stationKey, stationPortKey, chargingSlotKey, bookingDate, customerCarKey } = req.body;
    const unitPerMinute = 3;
    const unitPerPrice = 2;
    const totalUnit = (chargingSlotKey.split(",").length * 15) * unitPerMinute;
    const totalPrice = totalUnit * unitPerPrice;
    const totalDiscount = 0;
    const totalTax = (totalPrice - totalDiscount) * TAX;
    const grandTotalPrice = (totalPrice - totalDiscount) + totalTax;
    const notes = "";
    return await bookingHelper(customerKey,
        customerCarKey,
        stationKey,
        stationPortKey,
        chargingSlotKey,
        totalUnit,
        'slot',
        new Date(bookingDate),
        totalPrice,
        totalPrice,
        totalDiscount,
        totalTax,
        grandTotalPrice,
        notes, res);
}

// book by charging
/**
 * 
 * @param {*} req {
 * stationId, stationPortId, charging slot key,
 * booking date
 * }
 * @param {*} res 
 */
exports.bookByCharging = async (req, res) => {
    const customerKey = req.jwtUser['id'];
    const { stationKey, stationPortKey, chargingSlotKey, bookingDate, customerCarKey, chargeUnit } = req.body;
    const unitPerMinute = 3;
    const unitPerPrice = 2;
    const totalPrice = chargeUnit * unitPerPrice;
    const totalDiscount = 0;
    const totalTax = (totalPrice - totalDiscount) * TAX;
    const grandTotalPrice = (totalPrice - totalDiscount) + totalTax;
    const notes = "";
    if (!((chargingSlotKey.split(",").length * 15) >= (chargeUnit / unitPerMinute))) {
        return res
            .status(400)
            .json({
                status: "warning",
                message: "Please select proper number of slots."
            });
    }
    return await bookingHelper(customerKey,
        customerCarKey,
        stationKey,
        stationPortKey,
        chargingSlotKey,
        chargeUnit,
        'charge',
        new Date(bookingDate),
        totalPrice,
        totalPrice,
        totalDiscount,
        totalTax,
        grandTotalPrice,
        notes, res);
}

// book by price
/**
 * 
 * @param {*} req {
 * stationId, stationPortId, charging slot key,
 * booking date
 * }
 * @param {*} res 
 */
exports.bookByPrice = async (req, res) => {
    const customerKey = req.jwtUser['id'];
    const { stationKey, stationPortKey, chargingSlotKey, bookingDate, customerCarKey, totalPrice } = req.body;
    const unitPerMinute = 3;
    const unitPerPrice = 2;
    const chargeUnit = totalPrice / unitPerPrice;
    const totalDiscount = 0;
    const totalTax = (totalPrice - totalDiscount) * TAX;
    const grandTotalPrice = (totalPrice - totalDiscount) + totalTax;
    const notes = "";
    if (!((chargingSlotKey.split(",").length * 15) >= (chargeUnit / unitPerMinute))) {
        return res
            .status(400)
            .json({
                status: "warning",
                message: "Please select proper number of slots."
            });
    }
    return await bookingHelper(customerKey,
        customerCarKey,
        stationKey,
        stationPortKey,
        chargingSlotKey,
        chargeUnit,
        'money',
        new Date(bookingDate),
        totalPrice,
        totalPrice,
        totalDiscount,
        totalTax,
        grandTotalPrice,
        notes, res);
}

/**
 * getAvailableSlot by date
 * booking date mm/dd/yyyy
 * @param {*} req 
 * @param {*} res 
 */
exports.getAvailableSlot = async (req, res) => {
    const { dateToCheck, stationKey,  stationPortKey} = req.body;

    let sql = "select chargingSlotKey from booking_details where bookingDate = ? and stationKey = ? and stationPortKey = ?";
    let slotSql = "select slotKey, slotStartTime, slotEndTime from charging_slots where status='active'";

    DB.query(sql, [(new Date(dateToCheck)), stationKey, stationPortKey], async (err, bookingResult) => {
        if (err) throw err;
        DB.query(slotSql, async (err, slotResult) => {
            const unAvailableSlots = [];
            if(bookingResult.length > 0) {
                bookingResult.map(br => {
                    unAvailableSlots.push(...unAvailableSlots, ...br['chargingSlotKey'].split(','))
                })
            }
            const uniqueUnAvailableSlots = [...new Set(unAvailableSlots)];
            slotResult = slotResult.map(d => {
                const available = !uniqueUnAvailableSlots.includes(d.slotKey.toString());
                return { ...d, available }
            });
            return res
                .status(200)
                .json({
                    status: "success",
                    message: `Found ${slotResult.length} data! Successfull`,
                    data: slotResult
                });
        });
    });
}

// get single station details
exports.getSingleStationDetails = async (req, res) => {
    let id = req.params.id;
    // let providerKey = req.jwtUser['userId'];
    let providerKey = 54;
    let sql = "SELECT * FROM service_stations WHERE id = ? AND providerKey=?";
    DB.query(sql, [id, providerKey], async (err, result) => {
        if (err) {
            return res
                .status(200)
                .json({
                    status: "warning",
                    message: `Somthing went wrong`,
                    data: []
                });
        }
        if (result.length > 0) {
            return res
                .status(200)
                .json({
                    status: "success",
                    message: `Found ${result.length} data! Successfull`,
                    data: result[0],
                });
        } else {
            return res
                .status(200)
                .json({
                    status: "warning",
                    message: "Data not found",
                    data: []
                });

        }
    })
}