const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const DB = require("./db");
const url = require("url");

app.use(cors());
// const jwt = require("jsonwebtoken");
// const jwtKey = "noun-n";

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(bodyParser.json());

const multer = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './storage/docs')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname)
    }
})

const upload = multer({ storage: storage })

// upload service provider documents 
let uploadMultipleInputFiles = upload.fields(
    [
        { name: 'panDoc', maxCount: 1 },
        { name: 'gstCertificateDoc', maxCount: 1 },
        { name: 'aadharFrontDoc', maxCount: 1 },
        { name: 'aadharBackDoc', maxCount: 1 },
        { name: 'stationLicenseDoc', maxCount: 1 },
    ]
)
// add car image
let uploadCarImage = upload.fields(
    [{ name: 'carImage', maxCount: 1 }]
)

const stationRouters = require("./app/station/routes");
const userRouters = require("./app/user/routes");
const adminRouters = require("./app/admin/routes");
const commonRouters = require("./app/common/routes");

app.use("/api/v1/station", uploadMultipleInputFiles, stationRouters);
app.use("/api/v1/admin", uploadCarImage, adminRouters);
app.use("/api/v1/user", userRouters);
app.use("/api/v1/common", commonRouters);

app.listen();
app.listen(process.env.PORT, () => {
    console.log(`Server running on port http://localhost:${process.env.PORT}`);
})



