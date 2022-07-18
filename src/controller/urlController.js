const urlModel = require("../model/urlModel")
const validUrl = require('valid-url')
const shortid = require('shortid')


const createUrl = async function (req, res) {
    try {
        const baseUrl = 'http:localhost:3000'
        let body = req.body;
        let { longUrl } = body;
        if (Object.keys(body) == 0) return res.status(400).send({ status: false, message: "please enter body" })

        if (body.longUrl.trim().length == 0) 
            return res.status(400).send({ status: false, message: "Enter long URL"})

            let urlReg = /^(ftp|http|https):\/\/[^ "]+$/;
            if (!urlReg.test(body.longUrl)) {
                return res.status(400).send({ status: false, message: "long URL is invalid " });
            }
            

        if (await urlModel.findOne({ longUrl })) 
            return res.status(400).send({ status: false, message: "url already exists in database" })
    
    
        if (!validUrl.isUri(baseUrl)) {
          return res.status(400).send({ status: false, message: "invalid base URL" })
        }
    
        const urlCode = shortid.generate();
        body.urlCode = urlCode
    
        if (validUrl.isUri(longUrl)) {
          const shortUrl = baseUrl + '/' + urlCode
          body.shortUrl = shortUrl
        }
        let saveData = await urlModel.create(body)
        return res.status(201).send({ status: true, data: saveData })
    
      } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
      }
    };


    const getUrl = async function (req, res) {
        try {
          let urlCode = req.params.urlCode
          let url = await urlModel.findOne({ urlCode})
          if (!url) {
            return res.status(404).send({ status: false, message: "No URL found"})
          }
          //return res.status(302).redirect(url.longUrl)
          return res.status(302).send({message: `Found. redirected to ${url.longUrl}`})
          
        }
        catch (error) {
          return res.status(500).send({ status: false, message: error.message });
        }
      };
module.exports.createUrl=createUrl
module.exports.getUrl=getUrl
