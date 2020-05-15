const mongoose = require('mongoose');
const Loginschema=mongoose.Schema({
  assetid:String,
  assetname:String,
  assetstatus:String,
  issuedto:String


})
module.exports=mongoose.model('asset',Loginschema)
