const mongoose = require('mongoose');
const Categoryschema=mongoose.Schema({
  categoryname:String,
  add_by:String,


})
module.exports=mongoose.model('category',Categoryschema)
