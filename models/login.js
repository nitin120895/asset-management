const mongoose = require('mongoose');
const Loginschema=mongoose.Schema({

  name:String,
  email:String,
  password:String,
  designation:String,
  managerid:String,
  employeeid:String,
  supportid:String,

  status:Number,


  mobile:Number,
  doj:{type:Date,default:Date.now}

})
module.exports=mongoose.model('login',Loginschema)
