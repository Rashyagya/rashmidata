const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')
const Validator = require("../validation/validation");

//---------------------------------------Authentication------------------------------------------------//

const authentication = async function (req, res, next) {
  try {
    let token = req.header("Authorization")
    // console.log(token)
    token = token.replace("Bearer ","")
    // console.log(token)
      jwt.verify(token,"group-22-productManangement",function(err,decodedToken){
      if(err) return res.status(401).send({ status: false, msg: "invalid Token" });
      req.idDecoded = decodedToken.userId
    })
    // console.log(decodedToken)

    
    console.log(req.idDecoded)
    next()
  }
  catch (err) {
    return res.status(500).send({ err: err.message })
  }
}

//--------------------------------------------Authorization--------------------------------------//

// const authorization = async function (req , res , next){
//   try{
//     let userId = req.params.userId
//     if(Validator.isValidObjectId) return return res.status(401).send({ status: false, msg: "enter valid UserId" });

    
//   }
//   catch(err){
//     return res.status(500).send({ err: err.message })
//   }
//   }

module.exports = {authentication}