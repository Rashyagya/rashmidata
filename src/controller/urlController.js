const urlModel = require("../model/urlModel")
const validUrl = require('valid-url')
const shortid = require('shortid')
const {isValid,isValidBody,isValidUrl}= require("../validation/validation")

const redis = require("redis");

const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
  13221,
  "redis-13221.c264.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("ATVcrAv33hlBmxIRFLORxy7p2GWijTiO", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});


//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


//creating short url
const createUrl = async function (req, res) {

  try {
      const baseUrl = 'http://localhost:3000'
      let body = req.body;
      let { longUrl } = body;

      // if (Object.keys(body) == 0) return res.status(400).send({ status: false, message: 'please enter body' })

      if(!isValidBody(body)) return res.status(400).send({ status:false,message:"Body Should not be empty" }) 
      if(!("longUrl" in body)) return res.status(400).send({ status:false,message:"LongUrl Is required" })
      
      if(!isValid(longUrl)) return res.status(400).send({ status:false, message: "LongUrl should not be empty" })
      if(!isValidUrl(longUrl)) return res.status(400).send({ status:false, message: `${longUrl} is not a valid url` })

    //  if (await urlModel.findOne({ longUrl })) {
        let cachedData = await GET_ASYNC(`${longUrl}`)
        if(cachedData){
          console.log(cachedData)
          console.log(typeof cachedData)
          check= JSON.parse(cachedData)
        return res.status(201).send({ status: true, message:"Data coming from cache", data: check })}
  
        if (!validUrl.isUri(baseUrl)) {
        return res.status(400).send({ status: false, message: 'invalid base URL' })
      }
  
      const urlCode = shortid.generate();
      body.urlCode = urlCode
  
      if (validUrl.isUri(longUrl)) {
        const shortUrl = baseUrl + '/' + urlCode
        body.shortUrl = shortUrl
      }
      let Data = await urlModel.create(body)
      let saveData= await urlModel.findOne({longUrl:longUrl}).select({_id:0,createdAt:0,updatedAt:0,__v:0})
      await SET_ASYNC(`${longUrl}`, JSON.stringify(saveData))
      return res.status(201).send({ status: true,message:"Data coming from db", data: saveData })
  
    } catch (error) {
      return res.status(500).send({ status: false,message: error.message });
    }
  };




//------------------------------------------------------
//get data using shortUrl

    const getUrl = async function (req, res) {
        try {

          let urlCode = req.params.urlCode.trim()

          if(!shortid.isValid(urlCode)) return res.status(400).send({status:false,message:"Pls Enter valid urlCode Format"})
          let cachedData = await GET_ASYNC(`${urlCode}`)
          if(cachedData) {
            cachedUrlData = JSON.parse(cachedData);
            return res.status(302).redirect(cachedUrlData.longUrl)
         }
         else {
              let url = await urlModel.findOne({ urlCode })
             if (!url) {
                  return res.status(404).send({ status: false, message: 'No such shortUrl found' })
              }
              //await SET_ASYNC(`${urlCode}`, JSON.stringify(url))
              return res.status(302).redirect(url.longUrl)
              }

        }
        catch (error) {
          return res.status(500).send({ status: false, message: error.message });
        }
      };

     module.exports.createUrl = createUrl
     module.exports.getUrl = getUrl
