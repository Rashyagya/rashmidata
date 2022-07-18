const express=require('express');
const router= express.Router()
const urlController= require("../controller/urlController")

//------------------------create long to short url (Post API)---------------------------------//-------------------------

router.post('/url/shorten',urlController.createUrl)

//-------------------------(get API)get url with urlcode------------------------------------------------

router.get('/:urlCode',urlController.getUrl )


module.exports = router;