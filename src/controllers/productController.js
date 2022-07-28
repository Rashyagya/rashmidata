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
    if(data.style){
      if(typeof data.style != "string"){
        return res.status(400).send({
          status: false,
          message: "Style can't be "+typeof data.style,
        });
      }
      if(typeof data.style == "string"&& data.style.trim().length===0){
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

//---------------------------------------Get Api(getProduct by Filter)-------------------------------------------//

const getProduct = async function (req, res) {
  try {
    let filter = req.query;
    let filters = { isDeleted: false };
    if (filter) {
      const { name, size, priceSort } = filter;

      let nameIncludes = new RegExp(`${filter.name}`, "gi");

      if (name) {
       filter.description = nameIncludes;
      }
      if(priceSort) {
        filter.priceSort = { $all: priceSort}
      }
      if (size) {
        const sizeArr = size.trim().split(",").map((x) => x.trim());
        filter.availableSizes = { $all: sizeArr };
      }
    }
    let data = await productModel.find(filter).sort({ price: filter.priceSort });
    if (data.length == 0) {
      return res.status(400).send({ status: false, message: "NO data found" });
    }
      return res.status(200).send({ status: true,message: "Success", count: data.length,data: data,});

  } catch (err) {
    return res.status(500).send({ status: false, error: err.message });
  }
};

//---------------------------------------Get Api(get productDetail by ProductId)---------------------------//

const getProductById = async function(req, res){
    try {
        let productId = req.params.productId;

        if (!Validator.isValidObjectId(productId)) {
          return res.status(400).send({ status: false, message: "enter valid productId" });
        }
        let data = await productModel.findOne({_id: productId, isDeleted: false})
        if(!data){
           return res.status(404).send({ status: false, message: "No product found by this Product id" });
        }

        res.status(200).send({ status: true, message: "product details", data: data })

      } catch (err) {
        res.status(500).send({ err: err.message });
      }

};


//------------------------------------Delete Api--------------------------------------------//


const deleteProducts = async function(req, res){
  let productId = req.params.productId

  if (!Validator.isValidObjectId(productId)) {
         return res.status(400).send({ status: false, message: "enter valid productId" });
     }
  let data = await productModel.findOne({_id: productId, isDeleted: false})
  if(!data){
     return res.status(404).send({ status: false, message: "Product already deleted" });
  }
  let deletedData = await productModel.findOneAndUpdate({_id:productId},{isDeleted:true,deletedAt:new Date()},{new:true})
  return res.status(200).send({status: true, message: "success", data: deletedData})

<<<<<<< HEAD


module.exports = {createProduct};
=======
}

module.exports = { createProduct,getProduct ,getProductById, deleteProducts };
>>>>>>> e745c6c96960c7b0c4b54a52c3fbaa37c2be3c8d
