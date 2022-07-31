const productModel = require("../models/productModel");
const { uploadFile } = require("../aws/aws");
const Validator = require("../validation/validation");

const createProduct = async function (req, res) {
  try {
    let data = JSON.parse(JSON.stringify(req.body));
    let files = req.files;
    // let { title, description, price, currencyId, currencyFormat, availableSizes } = data;


    if (Validator.isValidBody(data)) {
      return res.status(400).send({
        status: false,
        message: "Product data is required",
      });
    }

    //validation for title
    if (!Validator.isValidInputValue(data.title)) {
      return res.status(400).send({
        status: false,
        message: "title is required"
      });
    }
    if (!isNaN(parseInt(data.title))) {
      return res.status(400).send({ status: false, message: "title should be string" });

    }

    if (await productModel.findOne({ title: data.title })) {
      return res.status(400).send({ status: false, message: "product already exists" })
    }

    //validation for description
    if (!Validator.isValidInputValue(data.description)) {
      return res.status(400).send({
        status: false,
        message: "Description is required "
      });
    }

    //validation for price
    if (!data.price) {
      return res.status(400).send({
        status: false,
        message: "price is required "
      });
    }

    if (isNaN(parseInt(data.price))) {
      return res.status(400).send({
        status: false,
        message: "price should be Number"
      });
    }

    data.price = parseInt(data.price)

    // //validations for currencyId
    // if (!Validator.isValidInputValue(data.currencyId)) {
    //   return res.status(400).send({
    //     status: false,
    //     message: "currencyID is required "
    //   });
    // }
    data.currencyId = "INR"
    data.currencyFormat = "₹"

    // // validations for currencyFormat
    // if (!Validator.isValidInputValue(data.currencyFormat)) {
    //   return res.status(400).send({
    //     status: false,
    //     message: "currencyFormat is required "
    //   });
    // }

    //validation for isFreeShipping
    if (data.isFreeShipping) {
      if (["true", "false"].indexOf(data.isFreeShipping) == -1) {
        return res.status(400).send({
          status: false,
          message: "free shipping can only be true or false"
        });
      }
      if (data.isFreeShipping === "True") {
        data.isFreeShipping = true
      }
      else {
        data.isFreeShipping = false
      }
    }

    // validations for availableSize
    if (!data.availableSizes) {
      return res.status(400).send({
        status: false,
        message: "available sizes is required "
      });
    }
    let sizeArr = data.availableSizes.split(",")
    if (sizeArr.length == 1) {
      if (["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(sizeArr[0]) == -1) {
        return res.status(400).send({
          status: false,
          message: "available sizes should be among S,XS,M,X,L,XXL,XL"
        });
      }
      data.availableSizes = sizeArr
    }
    else {
      for (let i = 0; i < sizeArr.length; i++) {
        if (["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(sizeArr[i]) === -1) {
          return res.status(400).send({
            status: false,
            message: "available sizes should be among S,XS,M,X,L,XXL,XL"
          });
        }
      }
      data.availableSizes = sizeArr
    }

    if (data.installments) {
      if (isNaN(parseInt(data.installments))) {
        return res.status(400).send({
          status: false,
          message: "Installments should be a number"
        });
      }
      data.installments = parseInt(data.installments)
    }

    //validations for product image

    if (data.hasOwnProperty("productImage") || !files) {
      return res
        .status(400)
        .send({ status: false, message: "productImage is required" });
    }
    if (files.length == 0) {
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

    // validation for style
    if (data.style) {
      if (!isNaN(parseInt(data.style))) {
        return res.status(400).send({
          status: false,
          message: "Style can't be a string"
        });
      }
      if (typeof data.style == "string" && data.style.trim().length === 0) {
        return res.status(400).send({
          status: false,
          message: "style can't be empty",
        });
      }
    }

    let savedData = await productModel.create(data);
    return res.status(201).send({
      status: true,
      message: "product created successfully",
      data: savedData,
    });
  } catch (err) {
    console.log(err)
    res.status(500).send({ err: err.message });
  }
};



//-------------------------------Update product-----------------------------//


const updateProductById = async function (req, res) {

  let productId = req.params.productId
  if (!Validator.isValidObjectId(productId)) {
    return res.status(400).send({ status: false, message: "enter valid productId" });
  }
  if (!await productModel.findOne({ _id: productId, isDeleted: false })) {
    return res.status(404).send({ status: false, message: "Product doesn't exist" })
  }

  let data = req.body
  let files = req.files;

  if (Validator.isValidBody(data)) {
    return res.status(400).send({ status: false, message: "atleast give one data that you want to update" });
  }

  if (data.title) {
    if (!isNaN(parseInt(data.title))) {
      return res.status(400).send({ status: false, message: "title should be string" });
    }

    if (await productModel.findOne({ title: data.title })) {
      return res.status(400).send({ status: false, message: "product already exists" })
    }
  }

  if (data.description) {
    if (!isNaN(parseInt(data.description))) {
      return res.status(400).send({ status: false, message: "description should be string" });
    }
  }

  if (data.price) {
    if (isNaN(parseInt(data.price))) {
      return res.status(400).send({
        status: false,
        message: "price should be Number"
      });
    }
    data.price = parseInt(data.price)
  }

  if (data.isFreeShipping) {
    if (["true", "false"].indexOf(data.isFreeShipping) == -1) {
      return res.status(400).send({
        status: false,
        message: "free shipping can only be true or false"
      });
    }
    if (data.isFreeShipping === "True") {
      data.isFreeShipping = true
    }
    else {
      data.isFreeShipping = false
    }
  }


  if (data.hasOwnProperty("productImage")&&files.length > 0) {

    if (!Validator.isValidImageType(files[0].mimetype)) {
      return res.status(400).send({
        status: false,
        message: "Only images can be uploaded (jpeg/jpg/png)",
      });
    }

    //uploading the photo
    let fileUrl = await uploadFile(files[0]);
    data.productImage = fileUrl;
  }

  if (data.style) {
    if (!isNaN(parseInt(data.style))) {
      return res.status(400).send({
        status: false,
        message: "style should be string",
      });
    }
    if (typeof data.style == "string" && data.style.trim().length === 0) {
      return res.status(400).send({
        status: false,
        message: "style can't be empty",
      });
    }
  }

  if (data.availableSizes) {
    let sizeArr = data.availableSizes.split(",")
    if (sizeArr.length == 1) {
      if (["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(sizeArr[0]) == -1) {
        return res.status(400).send({
          status: false,
          message: "available sizes should be among S,XS,M,X,L,XXL,XL"
        });
      }
      data.availableSizes = sizeArr
    }
    else {
      for (let i = 0; i < sizeArr.length; i++) {
        if (["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(sizeArr[i]) === -1) {
          return res.status(400).send({
            status: false,
            message: "available sizes should be among S,XS,M,X,L,XXL,XL"
          });
        }
      }
      data.availableSizes = sizeArr
    }
  }

  if (data.installments) {
    if (isNaN(parseInt(data.installments))) {
      return res.status(400).send({
        status: false,
        message: "Installments should be a number"
      });
    }
    data.installments = parseInt(data.installments)
  }
  let updatedData = await productModel.findOneAndUpdate({ _id: productId }, data, { new: true })
  res.status(200).send({ status: true, message: "updated", data: updatedData })
}




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


// const updateProduct

module.exports = { createProduct, updateProductById }