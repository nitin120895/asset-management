const mongoose = require('mongoose');
const Loginschema=mongoose.Schema({

  fromuser:String,
  touser:String,
  subject:String,
  massage:String,

  mail_date:{type:Date,default:Date.now}

})
module.exports=mongoose.model('mail',Loginschema)
