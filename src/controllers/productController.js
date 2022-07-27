const productModel = require("../models/productModel");
const bcrypt = require("bcrypt");
const { uploadFile } = require("../aws/aws");
const jwt = require("jsonwebtoken");
const Validator = require("../validation/validation");

const createProduct = async function (req, res) {
    try {
      let data = JSON.parse(JSON.stringify(req.body));
      let files = req.files;
      let { title, description, price, currencyId, currencyFormat, availableSizes } = data;
  
  
      if (!Validator.isValidBody(data)) {
        return res.status(400).send({
          status: false,
          message: "Product data is required",
        });
      }
  
      //validation for title
      if (!Validator.isValidInputValue(title)) {
        return res.status(400).send({
          status: false,
          message: "title is required"
        });
      }
      if (!Validator.isValidOnlyCharacters(title)) {
        return res.status(400).send({
          status: false,
          message: "title should contain only alphabets"
        });
      }
  
      //validation for description
      if (!Validator.isValidInputValue(description)) {
        return res.status(400).send({
          status: false,
          message: "Description is required "
        });
      }
      if (!Validator.isValidOnlyCharacters(description)) {
        return res.status(400).send({
          status: false,
          message: "description should contain only alphabets"
        });
      }
  
      //validation for price
      if (!Validator.isValidInputValue(price)) {
        return res.status(400).send({
          status: false,
          message: "price is required "
        });
      }
    
  
  
      //validations for currencyId
      if (!Validator.isValidInputValue(currencyId)) {
        return res.status(400).send({
          status: false,
          message: "currencyID is required "
        });
      }
     
       // validations for currencyFormat
       if (!Validator.isValidInputValue(currencyFormat)) {
        return res.status(400).send({
          status: false,
          message: "currencyFormat is required "
        });
      }
  
      // validations for availableSize
      if (!Validator.isValidInputValue(availableSizes)) {
        return res.status(400).send({
          status: false,
          message: "availableSizes is required ",
        });
      }
  
        //validations for product image
        if (!files || files.length == 0) {
          return res
            .status(400)
            .send({ status: false, message: "No product image found" });
        }
  
        if (!Validator.isValidImageType(files[0].mimetype)) {
          return res.status(400).send({
            status: false,
            message: "Only images can be uploaded (jpeg/jpg/png)",
          });
        }
        //uploading the photo
        let fileUrl = await uploadFile(files[0]);
        data.productImage = fileUrl;
  
        //creating the data
        let savedData = await productModel.create(data);
        return res.status(201).send({
          status: true,
          message: "product created successfully",
          data: savedData,
        });
      } catch (err) {
        res.status(500).send({ err: err.message });
      }
    };



    // const getProductById = async function(req, res){
    //     try {
    //         let productId = req.params.productId;
    //         if (!Validator.isValidObjectId(productId)) {
    //           return res.status(401).send({ status: false, message: "enter valid productId" });
    //         }
      
    //         //  if (req.idDecoded != productId.toString()) {
    //         //   return res.status(401).send({ status: false, message: "you aren't authorized" });
      
    //         //  }
      
    //         let data = await productModel.findOne({ _id: productId });
      
    //         res.status(200).send({ status: true, message: "product details", data: data })
      
    //       } catch (err) {
    //         res.status(500).send({ err: err.message });
    //       }

    // };




module.exports = {createProduct};