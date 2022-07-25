const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')
const Validator = require("../validation/validation");

//---------------------------------------Authentication------------------------------------------------//

const authentication = async function (req, res, next) {
  try {
    
  }
  catch (err) {
    return res.status(500).send({ err: err.message })
  }
}

//--------------------------------------------Authorization--------------------------------------//

const authorization = async function (req , res , next){
  try{
   
    
  }
  catch(err){
    return res.status(500).send({ err: err.message })
  }
  }

module.exports = {authentication , authorization}