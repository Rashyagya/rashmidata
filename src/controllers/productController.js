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

//---------------------------------------Get Api(getProduct by Filter)-------------------------------------------//

// const getProduct = async function (req, res) {
//   try {

//     let filter = req.query;
//     let filters = { isDeleted: false };
//     if (filter) {
//       const { name, size, priceSort } = filter;

//       let nameIncludes = new RegExp(`${filter.name}`, "gi");

//       if (name) {
//        filter.title = nameIncludes;
//       }
//       if(priceSort) {
//         filter.priceSort = { $all: priceSort}
//       }
//       if (size) {
// //         const sizeArr = size.trim().split(",").map((x) => x.trim());
// //         filter.availableSizes = { $all: sizeArr };
// //       }
// //     }
// //     let data = await productModel.find(filter).sort({ price: filter.priceSort });
// //     if (data.length == 0) {
// //       return res.status(400).send({ status: false, message: "NO data found" });
// //     }
// //       return res.status(200).send({ status: true,message: "Success", count: data.length,data: data,});

// //   } catch (err) {
// //     return res.status(500).send({ status: false, error: err.message });
// //   }
// // };
// const getProduct = async function (req, res) {
//   try {
//     let query = req.query
//     let obj = {
//       isDeleted: false
//     }
//     let sort = {
//       price: 1
//     }
//     let checkInput = Object.keys(query)
//     const { size, name, priceGreaterThan, priceLessThan, priceSort } = query
//     let arr = ["size", "name", "priceGreaterThan", "priceLessThan", "priceSort"]
//     for (let i = 0; i < checkInput.length; i++) {
//       if (!(arr.includes(checkInput[i]))) {
//         return res.status(400).send({ status: false, message: `(${checkInput[i]}) is Not A valid filter name. Use filters from These filters [size,name,priceGreaterThan,priceLessThan] Instead Of (${checkInput[i]}) ` })
//       }
//     }
//     for (let i = 0; i < checkInput.length; i++) {
//       if (query[checkInput[i]].length == 0) return res.status(400).send({ status: false, message: `The (${checkInput[i]}) query should Not Be Empty` })
//     }
//     if (size) {
//       let sizes = size.toUpperCase().trim().split(",").map(e => e.trim())
//       for (let i = 0; i < sizes.length; i++) {
//         if (!isValidSize(sizes[i])) return res.status(400).send({ status: false, message: `The (${sizes[i]}) size is not from these [S,XS,M,X,L,XXL,XL] ` })
//       }
//       obj.availableSizes = { $all: sizes }
//     }
//     if (priceGreaterThan) {
//       if (isNaN(parseInt(priceGreaterThan))) return res.status(400).send({ status: false, message: "Price is Always in Number" })
//       obj.price = { $gt: priceGreaterThan }
//     }
//     if (priceLessThan) {
//       if (isNaN(parseInt(priceLessThan))) return res.status(400).send({ status: false, message: "Price is Always in Number" })
//       obj.price = { $lt: priceLessThan }
//     }
//     if (priceGreaterThan && priceLessThan) {
//       if ((isNaN(parseInt(priceLessThan))) && (isNaN(parseInt(priceGreaterThan)))) return res.status(400).send({ status: false, message: "Price is Always in Number" })
//       obj.price = { $lt: priceLessThan, $gt: priceGreaterThan }
//     }
//     if (name) {
//       if (!isValidTName(name)) return res.status(400).send({ status: false, message: "Pls Enter Valid Product Name" })
//       let lower = name.toLowerCase().trim()
//       obj.title = { $regex: lower }
//     }

//     if (priceSort) {
//       if (isNaN(parseInt(priceSort))) return res.status(400).send({ status: false, message: "The PriceSort Is only Ascending(1) or Descending(-1) in order" })
//       if (!((priceSort == 1) || (priceSort == -1))) return res.status(400).send({ status: false, message: "PriceSort Should be Only 1 oe -1" })
//       if (!(Object.keys(sort).length == 0)) {
//         delete (sort.price)
//       }
//       if (priceSort == -1) { sort.price = -1 }
//       else { sort.price = 1 }
//     }
//     let data = await productModel.find(obj).sort(sort)
//     if (data.length == 0) {
//       return res.status(404).send({ status: false, message: "No data found" })
//     }
//     res.status(200).send({ status: true, data: data })
//   }
//   catch (err) {
//     return res.status(500).send({ status: false, message: err.message })
//   }
// }

//---------------------------------------Get Api(get productDetail by ProductId)---------------------------//

const getProductById = async function (req, res) {
  try {
    let productId = req.params.productId;

    if (!Validator.isValidObjectId(productId)) {
      return res.status(400).send({ status: false, message: "enter valid productId" });
    }
    let data = await productModel.findOne({ _id: productId, isDeleted: false })
    if (!data) {
      return res.status(404).send({ status: false, message: "No product found by this Product id" });
    }

    res.status(200).send({ status: true, message: "product details", data: data })

  } catch (err) {
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


  if (Object.keys(data).indexOf("productImage")) {

    if (Object.keys(data).indexOf("productImage") != -1 && files.length === 0) {
      return res.status(400).send({
        status: false,
        message: "no file to update",
      });
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
      data.$push.availableSizes = sizeArr
      delete userData.availableSizes
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
      data.$push.availableSizes = sizeArr
      delete userData.availableSizes
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


const deleteProducts = async function (req, res) {
  let productId = req.params.productId

  if (!Validator.isValidObjectId(productId)) {
    return res.status(400).send({ status: false, message: "enter valid productId" });
  }
  let data = await productModel.findOne({ _id: productId, isDeleted: false })
  if (!data) {
    return res.status(404).send({ status: false, message: "Product already deleted" });
  }
  let deletedData = await productModel.findOneAndUpdate({ _id: productId }, { isDeleted: true, deletedAt: new Date() }, { new: true })
  return res.status(200).send({ status: true, message: "success", data: deletedData })

}

module.exports = { createProduct, getProduct, getProductById, updateProductById, deleteProducts };
