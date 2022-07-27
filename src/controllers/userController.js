const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const { uploadFile } = require("../aws/aws");
const jwt = require("jsonwebtoken");
const Validator = require("../validation/validation");
/* ------------------------------------------------POST/register-------------------------------------------------------- */

const createUser = async function (req, res) {
  try {
    let data = JSON.parse(JSON.stringify(req.body));
    console.log(data)
    let files = req.files;
    let { fname, lname, email, phone, password, address } = data;


    if (!Validator.isValidBody(data)) {
      return res.status(400).send({
        status: false,
        message: "User data is required for registration",
      });
    }

    //validation for fname
    if (!Validator.isValidInputValue(fname)) {
      return res.status(400).send({
        status: false,
        message: "First name is required"
      });
    }
    if (!Validator.isValidOnlyCharacters(fname)) {
      return res.status(400).send({
        status: false,
        message: "last name should contain only alphabets"
      });
    }

    //validation for lname
    if (!Validator.isValidInputValue(lname)) {
      return res.status(400).send({
        status: false,
        message: "Last name is required "
      });
    }
    if (!Validator.isValidOnlyCharacters(lname)) {
      return res.status(400).send({
        status: false,
        message: "last name should contain only alphabets"
      });
    }

    //validation for email
    if (!Validator.isValidInputValue(email)) {
      return res.status(400).send({
        status: false,
        message: "email is required "
      });
    }
    if (!Validator.isValidEmail(email)) {
      return res.status(400).send({
        status: false,
        message:
          "give a valid email address"
      });
    }

    if (await userModel.findOne({ email })) {
      return res
        .status(400)
        .send({ status: false, message: "Email address already exist" });
    }

    //validations for phone
    if (!Validator.isValidInputValue(phone)) {
      return res.status(400).send({
        status: false,
        message: "phone is required "
      });
    }
    if (!Validator.isValidPhone(phone)) {
      return res.status(400).send({
        status: false,
        message: "give a valid mobile number",
      });
    }
    if (await userModel.findOne({ phone })) {
      return res
        .status(400)
        .send({ status: false, message: "phone number already exist" });
    }

    // validations for password
    if (!Validator.isValidInputValue(password)) {
      return res.status(400).send({
        status: false,
        message: "password is required ",
      });
    }
    if (!Validator.isValidPassword(password)) {
      return res.status(400).send({
        status: false,
        message:
          "Password should be of 8 to 15 characters"
      });
    }

    //validations for address
    if (!Validator.isValidAddress(address)) {
      return res
        .status(400)
        .send({ status: false, message: "Address is required!" });
    }

    let addresses = ["shipping", "billing"];
    let locations = ["street", "city", "pincode"];
    for (let i = 0; i < addresses.length; i++) {
      if (!data.address[addresses[i]])
        return res
          .status(400)
          .send({ status: false, message: `${addresses[i]} is mandatory` });
      for (let j = 0; j < locations.length; j++) {
        if (!data.address[addresses[i]][locations[j]])
          return res.status(400).send({status: false, message: `In  ${addresses[i]}, ${locations[j]} is mandatory`});
      }

        if (!Validator.isValidOnlyCharacters(data.address[addresses[i]].city)) {
          return res.status(400).send({
            status: false,
            message: `In ${addresses[i]} , city is invalid`,
          });
        }

        if (!Validator.isValidPincode(data.address[addresses[i]].pincode)) {
          return res.status(400).send({
            status: false,
            message: `In ${addresses[i]} , pincode is invalid`,
          });
        }
      }

      //validations for profile image
      if (!files || files.length == 0) {
        return res
          .status(400)
          .send({ status: false, message: "No profile image found" });
      }

      if (!Validator.isValidImageType(files[0].mimetype)) {
        return res.status(400).send({
          status: false,
          message: "Only images can be uploaded (jpeg/jpg/png)",
        });
      }
      //uploading the photo
      let fileUrl = await uploadFile(files[0]);
      data.profileImage = fileUrl;

      const saltRounds = 10;
      let encryptedPassword = await bcrypt.hash(data.password, saltRounds)
      data.password = encryptedPassword;

      //creating the data
      let savedData = await userModel.create(data);
      return res.status(201).send({
        status: true,
        message: "User created successfully",
        data: savedData,
      });
    } catch (err) {
      res.status(500).send({ err: err.message });
    }
  };

  /* ----------------------------------------------POST/login---------------------------------------------------------*/

  const loginUser = async function (req, res) {
    try {
      let data = req.body;
      let { email, password } = data;

      if (!Validator.isValidBody(data)) {
        return res.status(400).send({
          status: false,
          message: "User data is required for login",
        });
      }

      if (!Validator.isValidInputValue(email) || !Validator.isValidEmail(email)) {
        return res.status(400).send({
          status: false,
          message: "Email is required and should be a valid email",
        });
      }

      if (
        !Validator.isValidInputValue(password) || !Validator.isValidPassword(password)
      ) {
        return res.status(400).send({
          status: false,
          message:
            "Password is required and should contain 8 to 15 characters and must contain atleast 1 digit",
        });
      }

      let hash = await userModel
        .findOne({ email: email })
      if (hash == null) {
        return res
          .status(400)
          .send({ status: false, message: "Email does not exist" });
      }

      let compare = await bcrypt.compare(password, hash.password).then((res) => {
        return res;
      });

      if (!compare) {
        return res.status(401).send({ status: false, message: "Incorrect Password" });
      }

      const token = jwt.sign(
        {
          userId: hash._id,
        },
        "group-22-productManangement",
        { expiresIn: "10hr" }
      );

      res.header("Authorization", "Bearer : " + token);
      return res.status(200).send({
        status: true,
        message: "User logged in successfully",
        data: { userId: hash._id, token: token },
      });
    } catch (err) {
      res.status(500).send({ err: err.message });
    }
  };


  const getUser = async function (req, res) {
    try {
      let userId = req.params.userId;
      if (!Validator.isValidObjectId(userId)) {
        return res.status(401).send({ status: false, message: "enter valid UserId" });
      }

      if (req.idDecoded != userId.toString()) {
        return res.status(401).send({ status: false, message: "you aren't authorized" });

      }

      let data = await userModel.findOne({ _id: userId });

      res.status(200).send({ status: true, message: "User profile details", data: data })

    } catch (err) {
      res.status(500).send({ err: err.message });
    }
  };


  //-----------------------update user---------------------------


  const updateUser = async function (req, res) {
    try {
      let data = JSON.parse(JSON.stringify(req.body));
      let files = req.files;
      console.log(data)
      if (!Validator.isValidBody(data)) {
        return res.status(400).send({
          status: false,
          message: "User data is required to update",
        });
      }

      let userId = req.params.userId

      if (!Validator.isValidObjectId(userId)) {
        return res.status(401).send({ status: false, message: "enter valid UserId" });
      }

      if (!await userModel.findOne({ _id: userId, isDeleted: false })) {
        return res.status(401).send({ status: false, message: "this user doesn't exist" });
      }

      if (req.idDecoded != userId.toString()) {
        return res.status(401).send({ status: false, message: "you aren't authorized" });
      }

      if (data.fname) {
        if (data.fname.trim().length == 0) {
          return res.status(400).send({ status: false, message: "fname can't be empty" });
        }
        if (!Validator.isValidOnlyCharacters(data.fname)) {
          return res.status(400).send({ status: false, message: "fname must be alphabets" });
        }
      }
      if (data.lname) {
        if (data.lname.trim().length == 0) {
          return res.status(400).send({ status: false, message: "lname can't be empty" });
        }
        if (!Validator.isValidOnlyCharacters(data.lname)) {
          return res.status(400).send({ status: false, message: "lname must be alphabets" });
        }
      }
      if (data.email) {
        if (data.email.trim().length == 0) {
          return res.status(400).send({ status: false, message: "email can't be empty" });
        }
        if (!Validator.isValidInputValue(data.email)) {
          return res.status(400).send({ status: false, message: "email must be alphabets" });
        }
      }
      if (data.email) {
        if (data.email.trim().length == 0) {
          return res.status(400).send({ status: false, message: "email can't be empty" });
        }
        if (!Validator.isValidInputValue(data.email)) {
          return res.status(400).send({ status: false, message: "email is not valid" });
        }
        if (await userModel.findOne({ email: data.email })) {
          return res.status(400).send({ status: false, message: "email already exists" });
        }
      }
      if (files.length === 1) {
        if (!Validator.isValidImageType(files[0].mimetype)) {
          return res.status(400).send({
            status: false,
            message: "Only images can be uploaded (jpeg/jpg/png)",
          });
        }
        let url = await uploadFile(files[0])
        data.profileImage = url
      }
      if (data.phone) {
        if (data.phone.trim().length == 0) {
          return res.status(400).send({ status: false, message: "phone can't be empty" });
        }
        if (!Validator.isValidInputValue(data.phone)) {
          return res.status(400).send({ status: false, message: "phone is not valid" });
        }
        if (await userModel.findOne({ phone: data.phone })) {
          return res.status(400).send({ status: false, message: "phone already exists" });
        }
      }
      if (data.password) {
        if (data.email.trim().length == 0) {
          return res.status(400).send({ status: false, message: "email can't be empty" });
        }
        if (!Validator.isValidPassword(data.password)) {
          return res.status(400).send({ status: false, message: "Password should be of 8 to 15 characters" });
        }
        let encryptedPassword = await bcrypt.hash(data.password, 10)
        data.password = encryptedPassword;

      }
      console.log(data)

      let updatedData = await userModel.findOneAndUpdate({ _id: userId }, data, { new: true })
      console.log(updatedData)
      res.status(200).send({
        status: true,
        message: 'Success',
        data: updatedData
      })



    } catch (err) {
      res.status(500).send({ err: err.message });
    }
  };





  module.exports = { createUser, loginUser, getUser, updateUser };