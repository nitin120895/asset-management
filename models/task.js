const mongoose = require('mongoose');
const Loginschema=mongoose.Schema({
  user:String,
  taskname:String,
  taskdescription:String,
  status:Number,
  completion_status:String,
  managerid:String,
   rating:Number,
  assigndate:{type:Date,default:Date.now},
  deadlinedate:{type:Date}


})
module.exports=mongoose.model('task',Loginschema)
