const express = require("express");
const route = require("./routes/route");
const multer = require('multer')
const bodyParser = require('body-parser')
const {default:mongoose}=require('mongoose')

const app=express();

app.use(bodyParser.json());
app.use(multer().any());

app.use(bodyParser.urlencoded({extended:true}))

mongoose.connect("mongodb+srv://Rashmivishwakarma:rashmi1996@cluster0.m1asu.mongodb.net/project2collegeintern?retryWrites=true&w=majority", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )



app.use('/',route)


app.listen(process.env.PORT || 3001, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3001))
});