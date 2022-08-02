const userModel = require("../models/userModel");
const productModel = require("../models/productModel");
const orderModel = require("../models/orderModel");
const Validator = require("../validation/validation");

//---------------------------Post Api(create order with userId)----------------------------------//

const createOrder = async function(req, res){

    try{
        const userId = req.params.userId;
        const body = req.body;

        //-----------Request Body Validation---------//

        if (body.length == 0) {
            return res.status(400).send({ status: false, message: "Please provide valid request body" });
        }

        if (!Validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "enter valid userId" });
        }
        const findUserId = await userModel.findById({ _id: userId });

        if (!findUserId) {
            return res.status(400).send({ status: false, message: `User doesn't exist by ${userId}`});
        }

        let totalPrice = 0
        let totalItems = 0

        for (let i = 0; i < body.length; i++) {

            if (!body[i].productId) {
                return res.status(400).send({ status: false, message: ` productId is required` });
            }
            if (!Validator.isValidObjectId(body[i].productId)) {
                return res.status(400).send({ status: false, message: `invalid productId ` });
            }
            const findProductId = await productModel.findOne({ _id: body[i].productId, isDeleted: false });
            if (!findProductId) {
                return res.status(400).send({ status: false, message: `Product doesn't exist by ${productId}` });
            }

            if (!Object.keys(body[i]).includes("quantity")) {
                return res.status(400).send({ status: false, message: ` quantity is required` });
            }
            if (typeof body[i].quantity != "number") {
                return res.status(400).send({ status: false, message: ` quantity should be a number` });
            }
            if (body[i].quantity < 1) {
                return res.status(400).send({ status: false, message: `quantity must be minimum 1` });
            }
            totalPrice += (findProductId.price * body[i].quantity)
            totalItems += (1 * body[i].quantity)
        }

        var findorder = await orderModel.findOne({ userId: userId, isDeleted: false })
        if (!findorder) {
            let order = {}
            order.userId = userId
            order.items = body
            order.totalPrice = totalPrice
            order.totalItems = totalItems
            let createdOrder = await orderModel.create(order)
            //console.log(createdOrder.items)
            return res.status(201).send({ status: true, message: "order created successfully", data: createdOrder })
        }
        let obj = {
            $push: { "items": body },
            totalPrice: findcart.totalPrice + totalPrice,
            totalItems: findorder.totalItems + totalItems
    
        }
        let createdOrder = await orderModel.findOneAndUpdate({ userId: userId }, obj ,{new: true})
        res.status(200).send({ status: true, message: "order updated successfully", data: createdOrder })

    }
    catch (err) {
    res.status(500).send({ err: err.message });
    }

}


//---------------------------Put Api(update order by userId)-------------------------------//

const updateOrder = async function(req,res){

    try{


    }
    catch (err){
        res.status(500).send({err : err.message });
    }
}

module.exports = {createOrder, updateOrder} 