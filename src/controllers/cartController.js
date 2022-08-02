const userModel = require("../models/userModel");
const productModel = require("../models/productModel");
const cartModel = require("../models/cartModel");
const Validator = require("../validation/validation");

//-----------------------------------------Post Api(create cart with userId)-------------------------------//

const createCart = async function (req, res) {
    try {
        const userId = req.params.userId;
        const body = req.body;

        //-----------Request Body Validation---------//
        if (body.length == 0) {
            return res.status(400).send({ status: false, message: "Please provide valid request body" });
        }

        if (!Validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "enter valid userId" });
        }
        const user = await userModel.findById({ _id: userId });

        if (!user) {
            return res.status(400).send({ status: false, message: `User doesn't exist by ${userId}` });
        }
        if (!body.productId) {
            return res.status(400).send({ status: false, message: ` productId is required` });
        }
        if (!Validator.isValidObjectId(body.productId)) {
            return res.status(400).send({ status: false, message: `invalid productId ` });
        }
        const product = await productModel.findOne({ _id: body.productId, isDeleted: false });

        if (!product) {
            return res.status(400).send({ status: false, message: `Product doesn't exist by ${productId}` });
        }
        let totalPrice = 0
        if (Object.keys(body).includes("quantity")) {
            if (typeof body.quantity != "number") {
                return res.status(400).send({ status: false, message: ` quantity should be a number` });
            }
            if (body.quantity <= 1) {
                return res.status(400).send({ status: false, message: `quantity must be minimum 1` });
            }
            totalPrice += (product.price * body.quantity)
        } else {
            body.quantity = 1
            totalPrice += product.price
        }

        var cart = await cartModel.findOne({ userId: userId, isDeleted: false })
        if (!cart) {
            let cart = {}
            cart.userId = userId
            cart.items = body
            cart.totalPrice = totalPrice
            cart.totalItems = 1
            let createdCart = await cartModel.create(cart)
            console.log(createdCart.items)
            return res.status(201).send({ status: true, message: "cart created successfully", data: createdCart })
        }
        
        for (let i=0; i < cart.items.length; i++) {
            if (cart.items[i].productId == body.productId) {
                if (Object.keys(body).includes("quantity")) {
                    cart.items[i].quantity+= body.quantity
                }else{
                    cart.items[i].quantity+=1
                }
                let createdCart = await cartModel.findOneAndUpdate({ userId: userId }, {"items":cart.items,totalPrice: cart.totalPrice + totalPrice}, { new: true })
               return res.status(200).send({ status: true, message: "cart updated successfully", data: createdCart })
                
            }

        }
        let obj = {
            $push: { "items": body },
            totalPrice: cart.totalPrice + totalPrice,
            totalItems: cart.totalItems + 1
        }
        let createdCart = await cartModel.findOneAndUpdate({ userId: userId }, obj, { new: true })
        res.status(200).send({ status: true, message: "cart updated successfully", data: createdCart })

    } catch (err) {
        console.log(err)
        res.status(500).send({ err: err.message });
    }
};


//----------------------------------------Put Api(update cart by userId)------------------------------//    

const updateCart = async function (req, res) {
    try {
        let userId = req.params.userId

        if (!Validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "give a valid userId" });

        }
        const user = await userModel.findById({ _id: userId });

        if (!user) {
            return res.status(400).send({ status: false, message: `User doesn't exist by ${userId}` });
        }

        let body = req.body
        if (!body.productId) {
            return res.status(400).send({ status: false, message: `please give a productId` });

        }
        if (!Validator.isValidObjectId(body.productId)) {
            return res.status(400).send({ status: false, message: "give a valid productId" });

        }
        const findproductId = await productModel.findById({ _id: body.productId });

        if (!findproductId) {
            return res.status(400).send({ status: false, message: `User doesn't exist by ${body.productId}` });
        }

        if (!Object.keys(body).includes("removeProduct")) {
            return res.status(400).send({ status: false, message: `give removeProduct in body as a key` });

        }

        if (typeof body.removeProduct != "number") {
            return res.status(400).send({ status: false, message: `removeProduct should be a number` });

        }
        if ([1, 0].indexOf(body.removeProduct) === -1) {
            return res.status(400).send({ status: false, message: "removeProduct can only be 1 0r 0" });

        }
        if (body.removeProduct === 1) {
            let cart = await cartModel.findOne({ userId: userId })
            if (!cart) return res.status(400).send({ status: false, message: `no cart available for ${userId}` });

            console.log(cart)
            for (let i = 0; i < cart.items.length; i++) {
                if (cart.items[i].productId == body.productId && cart.items[i].quantity >= 1) {
                    cart.items[i].quantity -= 1
                    if (cart.items[i].quantity === 0) {
                        cart.items.splice(i, 1)
                    }
                    cart.totalItems -= 1
                    cart.totalPrice -= findproductId.price
                    break;
                }
            }
            let changedCart = await cartModel.findOneAndUpdate({ userId: userId }, { "items": cart.items, }, { new: true })
            res.status(200).send({ status: true, message: "cart updated successfully", data: changedCart })
        }
        else {
            let cart = await cartModel.findOne({ userId: userId })
            console.log(cart)
            for (let i = 0; i < items; i++) {
                if (cart.items[i].productId == body.productId) {
                    cart.items.splice(i, 1)
                }
            }
        }


    } catch (err) {
        console.log(err)
        res.status(500).send({ err: err.message });
    }
};




module.exports = { createCart, updateCart }   