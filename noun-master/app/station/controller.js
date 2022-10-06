const DB = require("../../db");
const jwt = require("jsonwebtoken");
const jwtKey = "noun-n";
const { json } = require("express/lib/response");

// service provider login details
exports.serviceProviderAndStationLogin = async (req, res) => {
    let OTP = Math.floor(1000 + Math.random() * 9000);
    let phone = req.body.phone;

    let otp = OTP;
    let otpDura = 600000;
    let currentTimeMillis = new Date().getTime();
    let otpExpiredAt = currentTimeMillis + otpDura;
    let otpExpiredDate = new Date(otpExpiredAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });

    let test = DB.getConnection(async (err, connection) => {
        connection.release();
        if (err) {
            return res.status(400).json({ err });
        } else {
            let sql = "SELECT * FROM `users` WHERE `phone`=? AND (`role`='station' OR `role`='provider')";
            DB.query(sql, [phone], async (err, result) => {
                if (err) throw err;

                if (result.length == 1) {
                    let row = result[0];

                    DB.query(`UPDATE users SET otp = ?, otpExpiredAt=? WHERE id=?`, [otp, otpExpiredAt, row['id']], async (err, result) => {
                        if (err) {
                            return res.status(200).json({
                                status: 'warning',
                                message: 'Something went wrong 55',
                            });
                        } else {
                            // OTP sent function will be here
                            return res.status(200).json({
                                status: 'success',
                                type: "exist",
                                message: 'Otp has been sent to your mobile number',
                                otp: `Your OTP is ${OTP}`
                            });
                        }
                    });

                } else {
                    let sql = "INSERT INTO users SET phone=?, otp=?, otpExpiredAt=?, role='provider'";
                    let test2 = DB.query(sql, [phone, otp, otpExpiredAt], async (err, result) => {
                        if (err) {
                            return res.status(200).json({
                                status: 'warning',
                                message: 'Something went wrong 2',
                                sql : test2.sql
                            });
                        } else {
                            // OTP sent function will be here
                            return res.status(200).json({
                                status: 'success',
                                type: "not-exist",
                                message: 'Otp has been sent to your mobile number',
                                otp: `Your OTP is ${OTP}`
                            });
                        }
                    });
                }
                // })
            });
        }
    })
}

// verifyOtp
exports.verifyOtp = async (req, res) => {
    let phone = req.body.phone;
    let otp = req.body.otp;

    DB.getConnection(async (err, connection) => {
        connection.release();
        if (err) {
            return res.status(200).json({
                status: 'warning',
                message: 'Something went wrong, try again',
            });
        } else {
            let sql = "SELECT * FROM `users` WHERE `phone` = ? AND (`role`='provider' OR `role`='station')";
            DB.query(sql, [phone], async (err, result) => {
                if (err) {
                    return res.status(200).json({
                        status: 'warning',
                        message: 'Something went wrong, try again',
                    });
                } else {
                    if (result.length == 1) {
                        let row = result[0];
                        // let profileStatus = "inreview";
                        if (row['otp'] == otp) {

                            jwt.sign({ userId: row['id'], userRole: row['role'] }, jwtKey, { expiresIn: "24h" }, (err, token) => {
                                if (err) {
                                    return res.status(200).json({
                                        status: 'warning',
                                        message: 'Something went wrong, try again',
                                    });
                                } else {

                                    return res.status(200).json({
                                        status: 'success',
                                        message: 'Login success',
                                        accessToken: token,
                                    });
                                }
                            });
                        } else {
                            return res.status(200).json({
                                status: 'warning',
                                message: 'Invalid otp',
                            });
                        }
                    } else {
                        return res.status(200).json({
                            status: 'warning',
                            message: 'Mobile number does not exist! Try another mobile.',
                            sql, result
                        });
                    }
                }
            });
        }
    })
}

// profileStatus
exports.profileStatus = async (req, res) => {
    DB.getConnection(async (err, connection) => {
        connection.release();
        if (err) {
            return res.status(200).json({
                status: 'warning',
                message: 'Something went wrong, try again',
            });
        } else {
            if (req.jwtUser['userRole'] == "provider") {
                DB.query("SELECT * FROM `service_providers` WHERE `providerKey`=?", [req.jwtUser['userId']], async (err, result) => {
                    if (err) {
                        return res.status(200).json({
                            status: 'warning',
                            message: 'Something went wrong, try again',
                        });
                    } else {
                        if (result.length > 0) {
                            return res.status(200).json({
                                status: 'success',
                                message: 'Profile status fetch success',
                                profileStatus: result[0]['status']
                            });
                        } else {
                            return res.status(200).json({
                                status: 'warning',
                                message: 'Profile status fetch failed'
                            });
                        }
                    }
                })
            } else {
                let sql = "SELECT `service_providers`.`status` FROM `service_stations`, `service_providers` WHERE `service_stations`.`providerKey`=`service_providers`.`providerKey` AND `service_stations`.`stationUserKey`=?";
                DB.query(sql, [req.jwtUser['userId']], async (err, result) => {
                    if (err) {
                        return res.status(200).json({
                            status: 'warning',
                            message: 'Something went wrong, try again',
                        });
                    } else {
                        if (result.length > 0) {
                            return res.status(200).json({
                                status: 'success',
                                message: 'Profile status fetch success',
                                profileStatus: result[0]['status']
                            });
                        } else {
                            return res.status(200).json({
                                status: 'warning',
                                message: 'Profile status fetch failed'
                            });
                        }
                    }
                })
            }
        }
    });
}

// service provider documents upload  
exports.serviceProviderDocumentsUpload = async (req, res) => {
    DB.getConnection(async (err, connection) => {
        connection.release();
        if (err) {
            return res
                .status(200)
                .json({
                    status: "warning",
                    message: "Somthing went wrong"
                });
        } else {
            if (req.jwtUser['userRole'] == "provider") {
                console.log(req.files);
                let providerKey = req.jwtUser['userId'];
                let name = req.body.name;
                let email = req.body.email;
                let panNumber = req.body.panNumber;
                let panDoc = req.files.panDoc[0].filename;
                let gstNumber = req.body.gstNumber;
                let gstCertificateDoc = req.files.gstCertificateDoc[0].filename;
                let aadharNumber = req.body.aadharNumber;
                let aadharFrontDoc = req.files.aadharFrontDoc[0].filename;
                let aadharBackDoc = req.files.aadharBackDoc[0].filename;
                let stationLicenseNumber = req.body.stationLicenseNumber;
                let stationLicenseDoc = req.files.stationLicenseDoc[0].filename;
                let bankName = req.body.bankName;
                let bankAccountNo = req.body.bankAccountNo;
                let bankIfscCode = req.body.bankIfscCode;
                let bankUpi = req.body.bankUpi;
                let status = "inreview";

                let userQuery = "UPDATE `users` SET name=?, email=? WHERE id=?";
                DB.query(userQuery, [name, email, req.jwtUser['userId']], (error, result) => {
                    if (error) {
                        return res
                            .status(200)
                            .json({
                                status: "warning",
                                message: "Something wrong!"
                            });
                    } else {
                        DB.query("SELECT id FROM `service_providers` WHERE providerKey=?", [req.jwtUser['userId']], (err, result) => {
                            if (err) {
                                return res
                                    .status(200)
                                    .json({
                                        status: "warning",
                                        message: "Something wrong!"
                                    });
                            } else {
                                if (result.length > 0) {
                                    return res
                                        .status(200)
                                        .json({
                                            status: "warning",
                                            message: "You have already submitted details!"
                                        });
                                } else {
                                    let query = "INSERT INTO `service_providers`(`providerKey`, `panNumber`, `panDoc`, `gstNumber`, `gstCertificateDoc`, `aadharNumber`, `aadharFrontDoc`, `aadharBackDoc`, `stationLicenseNumber`,`stationLicenseDoc`, `bankName`, `bankAccountNo`, `bankIfscCode`, `bankUpi`, `status`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

                                    DB.query(query, [
                                        providerKey,
                                        panNumber,
                                        panDoc,
                                        gstNumber,
                                        gstCertificateDoc,
                                        aadharNumber,
                                        aadharFrontDoc,
                                        aadharBackDoc,
                                        stationLicenseNumber,
                                        stationLicenseDoc,
                                        bankName,
                                        bankAccountNo,
                                        bankIfscCode,
                                        bankUpi,
                                        status,
                                    ], (error, result) => {
                                        if (error) {
                                            return res
                                                .status(200)
                                                .json({
                                                    status: "warning",
                                                    message: "Something wrong!"
                                                });
                                        } else {
                                            return res
                                                .status(200)
                                                .json({
                                                    status: "success",
                                                    message: "Profile uploaded, waiting for approval!"
                                                });
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            } else {
                return res
                    .status(200)
                    .json({
                        status: "warning",
                        message: "Only service provider can update details!"
                    });
            }
        }
    })
}

// service provider - get all document details
exports.getProviderDetails = async (req, res) => {

    if (req.jwtUser['userRole'] != "provider") {
        return res
            .status(200)
            .json({
                status: "warning",
                message: `You dont have access to get details!`,
                data: []
            });
    }

    let providerKey = req.jwtUser['userId'];


    let sql = "SELECT * FROM `service_providers` WHERE `providerKey`= ?";
    DB.query(sql, [providerKey], async (err, result) => {
        if (err) {
            return res
                .status(200)
                .json({
                    status: "warning",
                    message: `Somthing went wrong, try again!`,
                    data: []
                });
        };

        if (result.length == 1) {
            return res
                .status(200)
                .json({
                    status: "success",
                    message: `Found ${result.length} data! Successfull`,
                    data: result[0]
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

// add station
exports.addStation = async (req, res) => {
    DB.getConnection(async (err, connection) => {
        connection.release();
        if (err) {
            return res
                .status(200)
                .json({
                    status: "warning",
                    message: "Something went wrong"
                });
        } else {
            let providerKey = req.jwtUser['userId'];
            let name = req.body.name;
            let email = req.body.email;
            let phone = req.body.phone;
            let stationName = req.body.stationName;
            let licenseNumber = req.body.licenseNumber;
            let contactNumber = req.body.contactNumber;
            let stationAddress = req.body.stationAddress;
            let stationMapLat = req.body.stationMapLat;
            let stationMapLng = req.body.stationMapLng;
            let powerTypeIsAc = req.body.powerTypeIsAc;
            let powerTypeIsDc = req.body.powerTypeIsDc;
            let IsCafeAvailable = req.body.IsCafeAvailable;
            let IsParkAvailable = req.body.IsParkAvailable;
            let stationBanner = "image.jpg";

            let OTP = Math.floor(1000 + Math.random() * 9000);
            let otpDura = 600000;
            let currentTimeMillis = new Date().getTime();
            let otpExpiredAt = currentTimeMillis + otpDura;
            let otpExpiredDate = new Date(otpExpiredAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });

            // inserted station
            let sql = "INSERT INTO users SET name=?, phone=?, email=?, role='station', otp=?, otpExpiredAt=?";
            DB.query(sql, [name, phone, email, OTP, otpExpiredAt], (err, result) => {
                if (err) {
                    return res
                        .status(200)
                        .json({
                            status: "warning",
                            message: "Something went wrong",
                            sql
                        });
                }
                let insertId = result.insertId;

                // insered service stations
                let query = "INSERT INTO `service_stations`(`providerKey`, `stationUserKey`, `stationName`, `licenseNumber`, `contactNumber`, `stationAddress`, `stationMapLat`, `stationMapLng`, `powerTypeIsAc`, `powerTypeIsDc`, `IsCafeAvailable`, `IsParkAvailable`, `stationBanner`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";

                DB.query(query, [
                    providerKey,
                    insertId,
                    stationName,
                    licenseNumber,
                    contactNumber,
                    stationAddress,
                    stationMapLat,
                    stationMapLng,
                    powerTypeIsAc,
                    powerTypeIsDc,
                    IsCafeAvailable,
                    IsParkAvailable,
                    stationBanner,
                ], (error, result) => {
                    if (error) {
                        return res
                            .status(200)
                            .json({
                                status: "warning",
                                message: "Something went wrong",
                                query,
                            });
                    }
                    return res
                        .status(200)
                        .json({
                            status: "success",
                            message: "Station Added successfull",
                            data: result
                        });
                })
            });
        }
    })
}

// service provider - get all station details
exports.getAllStationDetails = async (req, res) => {
    let providerKey = req.jwtUser['userId'];
    let sql = "SELECT * FROM service_stations WHERE providerKey = ?";
    var test = DB.query(sql, [providerKey], async (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            return res
                .status(201)
                .json({
                    status: "success",
                    message: `Found ${result.length} data! Successfull`,
                    data: result
                });
        } else {
            return res
                .status(404)
                .json({
                    status: "warning",
                    message: "Data not found"
                });
        }
    })
}

// get single station details
exports.getSingleStationDetails = async (req, res) => {
    let id = req.params.id;
    let providerKey = req.jwtUser['userId'];
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


// ∰⋰⋰⋰.⨌⨷⨷∰⋰⋰⋰.⨌⨷⨷∰⋰⋰⋰.⨌⨷⨷∰⋰⋰⋰.⨌⨷⨷∰⋰⋰⋰.⨌⨷⨷∰⋰⋰⋰.⨌⨷⨷∰⋰⋰⋰.⨌⨷⨷∰⋰⋰⋰.⨌⨷⨷∰⋰⋰⋰.⨌⨷⨷
//******************** */
// station login
//******************** */
// ∰⋰⋰⋰.⨌⨷⨷∰⋰⋰⋰.⨌⨷⨷∰⋰⋰⋰.⨌⨷⨷∰⋰⋰⋰.⨌⨷⨷∰⋰⋰⋰.⨌⨷⨷∰⋰⋰⋰.⨌⨷⨷∰⋰⋰⋰.⨌⨷⨷∰⋰⋰⋰.⨌⨷⨷∰⋰⋰⋰.⨌⨷⨷


// get station details
exports.stationDetails = async (req, res) => {
    let stationUserKey = req.jwtUser['userId'];
    let sql = "SELECT * FROM `service_stations` WHERE `stationUserKey`=?";
    DB.query(sql, [stationUserKey], async (err, result) => {
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
                    data: result[0]
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

// add station ports
exports.addStationPort = async (req, res) => {
    DB.getConnection(async (err, connection) => {
        connection.release();
        if (err) {
            return res
                .status(200)
                .json({
                    status: "warning",
                    message: "Something went wrong"
                });
        } else {
            let stationKey = req.jwtUser['userId'];
            let chargingPortKey = req.body.chargingPortKey;
            let portName = req.body.portName;
            let portPrice = req.body.portPrice;

            let query = "INSERT INTO `station_ports` SET `fldStationKey`=?, `chargingPortKey`=?, `fldStationPortName`=?, `fldStationPortPrice`=?";
            DB.query(query, [stationKey, chargingPortKey, portName, portPrice], (error, result) => {
                if (error) throw error;
                return res
                    .status(200)
                    .json({
                        status: "success",
                        message: "Port Added successfull",
                        data: result
                    });
            })
        }
    })
}

// get station port details
exports.getStationPorts = async (req, res) => {
    let stationKey = req.jwtUser['userId'];
    let sql = "SELECT * FROM `station_ports` WHERE `fldStationKey`=?";
    DB.query(sql, [stationKey], async (err, result) => {
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
                    data: result
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

// booking details
exports.bookingList = async (req, res) => {
    let stationKey = req.jwtUser['userId'];
    let sql = "SELECT `booking_details`.`bookingKey`, `booking_details`.`bookingType`, `booking_details`.`bookingDate`, `booking_details`.`price`, `booking_details`.`totalPrice`, `booking_details`.`totalDiscount`, `booking_details`.`totalTax`, `booking_details`.`grandTotalPrice`, `booking_details`.`status` AS bookingStatus, `station_ports`.`powerConsumption` AS portPowerConsumption, `station_ports`.`fldStationPortName` AS stationPortName, `charging_ports`.`portName`, `charging_ports`.`portType` FROM `booking_details`, `station_ports`, `charging_ports` WHERE `booking_details`.`stationKey` = ? AND `booking_details`.`stationPortKey` = `station_ports`.`fldStationPortKey` AND `booking_details`.`stationPortKey` = `charging_ports`.`portKey`";
    let query = DB.query(sql, [stationKey], async (err, result) => {
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
                    data: result
                });
        } else {
            return res
                .status(200)
                .json({
                    status: "warning ",
                    message: "Data not found",
                    data: [],
                    sql: query.sql
                });
        }
    })
}

// get booking by port
exports.bookingDetails = async (req, res) => {
    let stationKey = req.jwtUser['userId'];
    let bookingKey = req.params.id;
    let sql = "SELECT `booking_details`.*,`charging_ports`.`portName`,`charging_ports`.`portDesc`,CONCAT('https://noun.achievextesting.one/storage/docs/',`charging_ports`.`portImage`) AS 'portImage',`charging_ports`.`portType`,`car_details`.`carBrand`,`car_details`.`carModel`,`car_details`.`carSubModel`,CONCAT('https://noun.achievextesting.one/storage/docs/',`car_details`.`carImage`) AS 'carImage', `users`.`name` AS 'customerName', `users`.`email` AS 'customerEmail', `users`.`phone` AS 'customerPhone' FROM `booking_details`,`car_details`,`charging_ports`, `users` WHERE `booking_details`.`customerCarKey`=`car_details`.`carKey` AND `booking_details`.`stationPortKey`=`charging_ports`.`portKey` AND `booking_details`.`customerKey`=`users`.`id` AND `booking_details`.`stationKey`=? AND `booking_details`.`bookingKey`=?";
    let query = DB.query(sql, [stationKey, bookingKey], async (err, result) => {
        console.log(query.sql);
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
            let slotkeys = result[0].chargingSlotKey;
            if (slotkeys == "") {
                slotkeys = 0;
            }
            let sql = `SELECT slotKey,slotStartTime,slotEndTime FROM charging_slots WHERE slotKey IN (${slotkeys})`;
            DB.query(sql, async (err, slotResult) => {
                if (err){ 
                    result[0]["slotList"]=[]; 
                    return res
                            .status(200)
                            .json({
                                status: "success",
                                message: `Found ${result.length} data! Successfull`,
                                data: result[0]
                            });
                }else{
                    result[0]["slotList"]=slotResult;
                    return res
                    .status(200)
                    .json({
                        status: "success",
                        message: `Found ${result.length} data! Successfull`,
                        data: result[0]
                    });
                }
            })

            
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