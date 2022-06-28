const mongoose = require('mongoose')

const authorSchema = new mongoose.Schema ({
    fname: {
        type: String,
        required : true,
    },
    lname: {
        type: String,
        required : true,
    }, 
    title: {
        type: String,
        required : true,
        enum: ["Mr" ,"Mrs", "Miss"]
    },
    email: {
        type: String,
        required : true,
        valid_email : true, 
        unique : true,
        // validate :{
        //     validator: function(email){
        //         return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
        //     }, message: 'Please fill a valid email address' , isAsync: false
        // }

    },
    password: {
        type: String,
        required : true,
    },
}, {timestamps : true});

module.exports = mongoose.model ('authorDB', authorSchema)
