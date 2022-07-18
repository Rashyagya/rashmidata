const mongoose= require("mongoose")
const isValid= function(value){
    if(typeof value== undefined || typeof value== null) return false
    if(typeof value=== "string" && value.trim().length==0) return false
    if(value == null) return false
    return true
}
const isValidBody=(body)=>{
    if(Object.keys(body).length==0) return false
    return true
}
const isValidUrl=(url)=>{
    if(/^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/.test(url)) return true
}

module.exports={isValid,isValidBody,isValidUrl}