const userModel = require("../models/userModel");
const productModel = require("../models/productModel");
const cartModel = require("../models/cartModel");
const Validator = require("../validation/validation");

//-----------------------------------------Post Api(create cart with userId)-------------------------------//

const createCart = async function (req, res) {
    try {


        

    } catch (err) {
        res.status(500).send({ err: err.message });
      }
    };
    
    
//----------------------------------------Put Api(update cart by userId)------------------------------//    

const updateCart = async function (req, res) {
    try {





    } catch (err) {
        res.status(500).send({ err: err.message });
      }
    };




 module.exports = {createCart , updateCart}   