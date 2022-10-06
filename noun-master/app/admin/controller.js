const DB = require("../../db");
const jwt = require("jsonwebtoken");
const jwtKey = "noun-n";

exports.adminLogin = async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

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
            let sql = "SELECT * FROM admin WHERE adminEmail = ? && adminPassword = ?";
            DB.query(sql, [email, password], async (err, result) => {
                if (err) {
                    return res
                        .status(200)
                        .json({
                            status: "warning",
                            message: "Something went wrong"
                        });
                }
                if (result.length == 1) {
                    let row = result[0];
                    jwt.sign({ adminKey: row['adminKey'], adminEmail: row['adminEmail'], userRole: 'admin' }, jwtKey, { expiresIn: "24h" }, (err, token) => {
                        if (err) {
                            return res
                                .status(200)
                                .json({
                                    status: "warning",
                                    message: "Something went wrong!"
                                });
                        }
                        return res
                            .status(202)
                            .json({
                                status: "success",
                                message: "Login Success!",
                                data: result,
                                token: token
                            });
                    })
                } else {
                    return res
                        .status(200)
                        .json({
                            status: "warning",
                            message: "Invalid login details",
                            data: []
                        });
                }
            });
        }
    })
}

// add car 
exports.addCar = async (req, res) => {
    let adminKey = req.jwtAdmin['adminKey'];
    let chargingPortKey = req.body.chargingPortKey;
    let carBrand = req.body.carBrand;
    let carModel = req.body.carModel;
    let carSubModel = req.body.carSubModel;
    let carImage = req.files.carImage[0].filename;

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
            let query = "INSERT INTO `car_details`(`adminKey`, `chargingPortKey`, `carBrand`, `carModel`, `carSubModel`, `carImage`) VALUES (?,?,?,?,?,?)";
            DB.query(query, [adminKey, chargingPortKey, carBrand, carModel, carSubModel, carImage], async (err, result) => {
                if (err) {
                    return res.status(400).json({ err });
                }
                return res
                    .status(201)
                    .json({
                        status: "success",
                        message: `Id ${result.insertId} Inserted successfull`,
                        data: result,
                    });
            });
        }
    })
}

// listAllCars
exports.listAllCars = async (req, res) => {
    // let adminKey = req.jwtAdmin['adminKey'];
    // DB.query("SELECT * FROM car_details WHERE adminKey=?", [adminKey], async (err, result) => {
    DB.query("SELECT `charging_ports`.portName, `car_details`.*, CONCAT('https://noun.achievextesting.one/storage/docs/',`car_details`.`carImage`) AS carImage FROM `car_details`, `charging_ports` WHERE `charging_ports`.portKey=`car_details`.`chargingPortKey`", async (err, result) => {
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
                    message: "Data not found",
                    data: []
                });
        }
    })
}

// allProviders
exports.providers = async (req, res) => {
    // let adminKey = req.jwtAdmin['adminKey'];
    let id = req.params.id;
    let sql = "SELECT `users`.`id`, `users`.`name`, `users`.`email`, `users`.`phone`, `users`.`role`, `service_providers`.`providerKey`, `service_providers`.`panNumber`, `service_providers`.`panDoc`, `service_providers`.`gstNumber`, `service_providers`.`gstCertificateDoc`, `service_providers`.`aadharNumber`, `service_providers`.`aadharFrontDoc`, `service_providers`.`aadharBackDoc`, `service_providers`.`stationLicenseNumber`, `service_providers`.`stationLicenseDoc`, `service_providers`.`bankName`, `service_providers`.`bankAccountNo`, `service_providers`.`bankIfscCode`, `service_providers`.`bankUpi`, `service_providers`.`status` AS approvalStatus, `users`.`status` AS userStatus FROM `service_providers`, `users` WHERE `service_providers`.`providerKey` = `users`.`id`";
    DB.query(sql, [id], async (err, result) => {
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
                    message: "Data not found",
                    data: []
                });
        }
    })
}

// allProviders
exports.providerDetails = async (req, res) => {
    // let adminKey = req.jwtAdmin['adminKey'];
    let id = req.params.id;
    let sql = "SELECT `users`.`name`, `users`.`email`, `users`.`phone`, `users`.`role`, `service_providers`.`providerKey`, `service_providers`.`panNumber`, `service_providers`.`panDoc`, `service_providers`.`gstNumber`, `service_providers`.`gstCertificateDoc`, `service_providers`.`aadharNumber`, `service_providers`.`aadharFrontDoc`, `service_providers`.`aadharBackDoc`, `service_providers`.`stationLicenseNumber`, `service_providers`.`stationLicenseDoc`, `service_providers`.`bankName`, `service_providers`.`bankAccountNo`, `service_providers`.`bankIfscCode`, `service_providers`.`bankUpi`, `service_providers`.`status` AS approvalStatus, `users`.`status` AS userStatus FROM `service_providers`, `users` WHERE `service_providers`.`providerKey` = `users`.`id` AND `service_providers`.`providerKey`=?";
    DB.query(sql, [id], async (err, result) => {
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
                    message: "Data not found",
                    data: []
                });
        }
    })
}

// approval status update 
exports.approvalStatus = async (req, res) => {
    // let adminKey = req.jwtAdmin['adminKey'];
    let id = req.params.id;
    let status = req.body.status;

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
            let sql = "UPDATE `service_providers` SET status=? WHERE providerKey=?";
            let query = DB.query(sql, [status, id], async (err, result) => {
                if (err) {
                    return res.status(400).json({ err });
                }
                return res
                    .status(201)
                    .json({
                        status: "success",
                        message: `Id ${result.insertId} Updated successfull`,
                        data: result,
                    });
            });
        }
    })
}


// customer list
exports.customerList = async (req, res) => {
    let sql = "SELECT * FROM `users` WHERE status='active'";
    DB.query(sql, async (err, result) => {
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
                    message: "Data not found",
                    data: []
                });
        }
    })
}



// add port
exports.addPort = async (req, res) => {
    // let adminKey = req.jwtAdmin['adminKey'];
    let portName = req.body.portName;
    let portType = req.body.portType;
    let portDesc = req.body.portDesc;
    // let portImage = req.files.portImage[0].filename;

    DB.getConnection(async (err, connection) => {
        connection.release();
        if (err) {
            return res
                .status(400)
                .json({
                    status: "warning",
                    message: "Something went wrong 2"
                });
        } else {
            let query = `INSERT INTO charging_ports SET portName=?, portDesc=?, portType=?`;
            DB.query(query, [portName, portDesc, portType], async (err, result) => {
                if (err) {
                    return res
                        .status(200)
                        .json({
                            status: "warning",
                            message: "somthing went wrong 5",
                            query: query
                        });
                }
                return res
                    .status(201)
                    .json({
                        status: "success",
                        message: `Id ${result.insertId} Inserted successfull`,
                        data: result
                    });
            });
        }
    })
}
