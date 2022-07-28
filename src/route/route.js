const express = require('express');
const router= express.Router()
const user = require("../controllers/userController")
const product = require("../controllers/productController")
const MW = require("../Middleware/auth")
//const aws = require("aws-sdk")

//-------------------------------------User------------------------------------------------//

router.post("/register", user.createUser)

router.post("/login" , user.loginUser)

router.get("/user/:userId/profile",MW.authentication,user.getUser)

router.put("/user/:userId/profile",MW.authentication,user.updateUser)


//------------------------------------Product-------------------------------------------//

router.post("/products", product.createProduct)

// router.get("/products/:productId", product.getProductById)









module.exports = router;