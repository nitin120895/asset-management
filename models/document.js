const mongoose = require('mongoose');
const Docschema=mongoose.Schema({
  uploadby:String,
  docname:String,
    filename:String,
  category:String,
  description:String,
  comment:String,
  department:String,
  adminstatus:String,
supportstatus:String,
managerstatus:String,
employeestatus:String,

//permissionfor who see the doc
  manager:String,
  hr:String,
  employee:String,
  support:String,


  uploaddate:{type:Date,default:Date.now},


})
module.exports=mongoose.model('document',Docschema)
