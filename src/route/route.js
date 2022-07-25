const express = require('express');
const router= express.Router()
const user = require("../controllers/userController")
//const MW = require("../Middleware/auth")
//const aws = require("aws-sdk")

//-------------------------------------User------------------------------------------------//

router.post("/register", user.createUser)

router.post("/login" , user.loginUser)








module.exports = router;