const urlModel = require("../model/urlModel")
const validUrl = require('valid-url')
const shortid = require('shortid')
const {isValid,isValidBody,isValidUrl}= require("../validation/validation")


const createUrl = async function (req, res) {
    try {
        const baseUrl = 'http:localhost:3000'
        let body = req.body;
        let { longUrl } = body;

        if(!isValidBody(body)) return res.status(400).send({ status:false,message:"Body Should not be empty" }) 
        if(!("longUrl" in body)) return res.status(400).send({ status:false,message:"Long Url Is required" })

        if(!isValid(longUrl))
           return res.status(400).send({ status:false, message: "Long Url should not be empty" })

        if(!isValidUrl(longUrl)) 
           return res.status(400).send({ status:false, message: `"${longUrl}" is not a valid url` })

        if (await urlModel.findOne({ longUrl })) 
            return res.status(400).send({ status: false, message: `"${longUrl}" already exist in the database` })
    
    
        if (!validUrl.isUri(baseUrl)) {
          return res.status(400).send({ status: false, message: "invalid base URL" })
        }
    
          const urlCode = shortid.generate();
          body.urlCode = urlCode
    
        if (validUrl.isUri(longUrl)) { 
          const shortUrl = baseUrl + '/' + urlCode
          body.shortUrl = shortUrl
        }
        
        let Data = await urlModel.create(body)
        let saveData= await urlModel.findOne({longUrl:longUrl}).select({_id:0,createdAt:0,updatedAt:0,__v:0})
        return res.status(201).send({ status: true, data: saveData })
    
      } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
      }
    };


    const getUrl = async function (req, res) {
        try {
          let urlCode = req.params.urlCode

          if(!shortid.isValid(urlCode)) return res.status(400).send({status:false,message:"Pls Enter valid urlCode Format"})
    
          let url = await urlModel.findOne({ urlCode })
          if (!url) {
            return res.status(404).send({ status: false, message: 'No such urlCode found' })
          }
          return res.status(302).redirect(url.longUrl)
          //return res.status(302).send({message: `Found. redirected to ${url.longUrl}`})
          
        }
        catch (error) {
          return res.status(500).send({ status: false, message: error.message });
        }
      };

     module.exports.createUrl=createUrl
     module.exports.getUrl=getUrl
