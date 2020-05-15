const mongoose = require('mongoose');
const Loginschema=mongoose.Schema({
  user:String,
  empid:String,
  managerid:String,
  assetid:String,
  assetname:String,
  supportid:String,
  status:Number,
  requestdate:{type:Date,default:Date.now}


})
module.exports=mongoose.model('request',Loginschema)
