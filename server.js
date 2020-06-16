const express = require('express');
const path = require('path');
const hbs = require('express-handlebars');
const bodyparser = require('body-parser');
const session = require('express-session');
const Handlebars = require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')


//express app creation

const app = express();

app.engine('handlebars',hbs({
    handlebars: allowInsecurePrototypeAccess(Handlebars)
}));


//config viewengine on hbs
app.set('views',path.join(__dirname,'views'))
app.set('view engine','hbs')

//back block
app.use(function(req,res,next){
  res.set('Cache-Control','no-cache,private,no-store,must-revalidate,max-state=0,post-check=0,pre-check=0');
  next();
});





//mainlayout

app.engine('hbs',hbs({
  extname:'hbs',
  defaultLayout:'mainlayout',
  layoutsDir:__dirname+'/views/layouts/'
}))

///apply session
app.use(session({secret:'asjhjhjhghg'}))

//nodemailer

var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'nitinproject12@gmail.com',
    pass: 'gurjar@95'
  }
});





//server config
app.listen(3000,()=>{
console.log("server started on port:3000")
})

//config body bodyparser
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({
  extended:true
}))


const mongoose = require('mongoose');
const URL="mongodb://localhost:27017/assetdb";
mongoose.connect(URL)

app.get('/',(req,res)=>{

  res.render('login')
})

app.get('/logout',(req,res)=>{
  req.session.destroy();

  res.render('login',{msg:"logout successfull"})
})

app.get('/addasset',(req,res)=>{
  res.render('addasset',{admin:req.session.admin})
})


const Login=require('./models/login')
const Asset=require('./models/asset')
const Request=require('./models/request')
const Task=require('./models/task')
const Mail=require('./models/mail')
const Category=require('./models/category')

/*
app.get('/insert',(req,res)=>{
  var Login1=Login({
    email:"admin.nitin@gmail.com",
    password:"admin123",
    designation:"admin",
    status:1
  })
  Login1.save()
  res.render('/')

})
*/
app.post('/logincheck',(req,res)=>{
  var userid=req.body.uid;
  var pass=req.body.pwd;
//  var designation=req.body.loginfor;

  Login.find({email:userid,password:pass},(err,result)=>{
    if(err)
    throw err;
    else if (result.length!=0) {
       console.log(result);

            if (result[0].designation==="employee") {
              req.session.employee=result[0].email

              if (result[0].status==1) {
                res.render("home",{data:result, employee:req.session.employee})
              }else {
                res.render("login",{msgf:"user deactivated !!!!"})
              }
            }

            else if (result[0].designation==="admin"&& result[0].status==1) {
              req.session.admin=result[0].email

              if (result[0].status==1) {
                res.render("home",{data:result, admin:req.session.admin})
              }else {
                res.render("login",{msgf:"user deactivated !!!!"})
              }
            }


            else if (result[0].designation==="manager") {
              req.session.manager=result[0].email

                if (result[0].status==1) {
                  res.render("home",{data:result, manager:req.session.manager})
                }else {
                  res.render("login",{msgf:"user deactivated !!!!"})
                }
            }
            else if (result[0].designation==="support") {
                          req.session.support=result[0].email

                          if (result[0].status==1) {
                            res.render("home",{data:result, support:req.session.support})
                          }else {
                            res.render("login",{msgf:"user deactivated !!!!"})
                          }
                        }

          }
    else {
      res.render('login',{msgf:'login fail'})
    }
  })

})

/////////////profile//////////////////////////

app.get('/profile',(req,res)=>{
  var user;
  if (req.session.employee) {
    user= req.session.employee
  }else if (req.session.manager) {
    user= req.session.manager
  }else if (req.session.support) {
    user= req.session.support
  }else
  user= req.session.admin

    Login.find({email:user},(err,result)=>{
      if(err)
      throw err;
      else if (result.length!=0) {
         console.log(">>>>>>>>>>>>"+result);

  res.render('profile',{data:result,admin:req.session.admin,employee:req.session.employee,manager:req.session.manager, support:req.session.support})
}
})
})


/////////////chang profile for all/////////////

app.get('/changeprofile',(req,res)=>{
  var user;
  if (req.session.employee) {
    user= req.session.employee
  }else if (req.session.manager) {
    user= req.session.manager
  }else if (req.session.support) {
    user= req.session.support
  }else
  user= req.session.admin

      Login.find({email:user},(err,result)=>{
        console.log(result);

        if(err)
        throw err;
        else if (result.length!=0) {

  res.render('changeprofile', {data:result, admin:req.session.admin,employee:req.session.employee,manager:req.session.manager,support:req.session.support})
}
})
})


app.post('/changeprofile',(req,res)=>{
  var uid=req.body.uid
  var uname=req.body.uname
  var umob=req.body.umob

  var cpwd=req.body.cpwd
  var npwd=req.body.npwd

Login.updateOne({email:uid,password:cpwd},{$set:{password:npwd,name:uname,mobile:umob}},(err,result)=>{
   if(err) throw err;
   else
         res.render('home',{msg:' profile details  changed successfully',admin:req.session.admin,employee:req.session.employee,manager:req.session.manager,support:req.session.support})
       })
  })


/////////////////////activate /deactivate user////////////////



app.get('/deactivate',(req,res)=>{
  var id=req.query.uid
  //  var manid=req.query.manid
  var status=req.query.status
  console.log(status);
  if (status=="activated") {
    status=0
  }else
  status=1
//  var manid=req.query.manid
console.log(id);
Login.updateOne({email:id},{$set:{status:status}},(err,result)=>{
    console.log(result);
    if(err)
    throw err;
    else if (result.nModified >0)
     {
          Login.find({email:id,status:status},(err,result)=>{
            console.log(result[0].status);
                if(err)
                throw err;
                else if (result[0].status==0)
                     res.render('home',{data:result,msg:"user deactivated", admin:req.session.admin})

            else

                res.render('home',{data:result, msg:"user....activated",admin:req.session.admin})
              })

          }

})
})


///show user////////////

app.get('/showuser',(req,res)=>{
  Login.find({$or:[{status:0},{status:1}]},(err,result)=>{
        if(err)
        throw err;
        else if (result.length != 0)
        {

          var requeststatus=result.map((rec)=>{
            console.log(rec.status);
            if (rec.status==0)
            return "deactivated";

            else (rec.status==1)
            return "activated";

          })
          var finaldata=result.map((rec,index)=>{
            var join={requeststatus:requeststatus[index]};
            var object={...rec,...join}
            return object;
      })
    res.render('showuser',{data:finaldata,admin:req.session.admin})
}
})
})


//////////////create user/////////


app.get('/createuser',(req,res)=>{

  res.render('createuser',{admin:req.session.admin})

})


app.post('/createuser',(req,res)=>{

  var subid=req.body.uid
  var subname=req.body.uname
  var submob=req.body.umob
  var subpwd=req.body.pwd
  var designation=req.body.designation
  var manid=req.body.manid
  var empid=req.body.empid
  var supid=req.body.supportid

  var status=1

  var Login1=Login({
    name:subname,
    email:subid,
    password:subpwd,
    designation:designation,
    managerid:manid,
    employeeid:empid,
    supportid:supid,
    mobile:submob,
    status:status

  })
  Login1.save().then((data)=>{
    console.log(data);
  var mailOptions = {
    from: 'nitinproject12@gmail.com',
    to: subid,
    subject: 'account created by admin',
    text: 'Hello '+subid+"\n now u are sub-admin of amazing.com  ,\n your login id is :"+subid+"\n your passwword is :"+subpwd
  };
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      throw(error);
    } else {
      res.render('home',{msg:'user create successfully \n info sent to user',admin:req.session.admin})
     // console.log('Email sent: ' + info.response);
    }
  })
})
})


/////////////////admin updateuser////////////
var ObjectID = require('mongodb').ObjectID;

/////////updatecode//////////////////

app.get('/upuser',(req,res)=>{
var sid=req.query.sid
Login.findOne({"_id": new ObjectID(sid)},(err,result)=>{
if(err) throw err;
else {
  console.log(result);
  res.render('updateuser',{data:result,admin:req.session.admin})
}
})
})

app.post('/updateuser',(req,res)=>{
  var sid=req.body.sid

  var subid=req.body.uid
  var subname=req.body.uname
  var submob=req.body.umob
  var subpwd=req.body.pwd
  var designation=req.body.designation
  var manid=req.body.manid
  var empid=req.body.empid


Login.updateOne({_id: sid},{$set:{name:subname,email:subid,mobile:submob,password:subpwd,designation:designation,managerid:manid,employeeid:empid}},(err,result)=>{
   if(err) throw err;
   else
{          console.log("Updated");
       Login.find((err,result)=>{
         console.log(result);

         if(err) throw err;
         res.render('home',{data:result,msg:' details updated',admin:req.session.admin})
       })
}
  })
})

/////////////////delete for alll things//////////////////

/////////////delet request///////
app.get('/deletereq',(req,res)=>{
var id=req.query._id;
console.log(id);
Request.deleteOne({_id:id},(err,result)=>{
if(err) throw err;
else
if(result.affectedRows!=0)
{
  Request.find((err,result)=>{
  if(err) throw err;
  else
    res.render('home',{data:result,employee:req.session.employee,manager:req.session.manager,msg:'request  Deleted'})
  })
}
})
})

///////////////////delete user/////////

app.get('/deleteuser',(req,res)=>{
var id=req.query._id;
console.log(id);
Login.deleteOne({_id:id},(err,result)=>{
if(err) throw err;
else
if(result.affectedRows!=0)
{
  Login.find((err,result)=>{
  if(err) throw err;
  else
    res.render('home',{data:result,admin:req.session.admin,msg:' user Data Deleted'})
  })
}
})
})


/////////////delet assets///////
app.get('/deleteasset',(req,res)=>{
var id=req.query._id;
console.log(id);
Asset.deleteOne({_id:id},(err,result)=>{
if(err) throw err;
else
if(result.affectedRows!=0)
{
  Asset.find((err,result)=>{
  if(err) throw err;
  else
    res.render('showassets',{data:result,admin:req.session.admin,msg:' asset  Data Deleted'})
  })
}
})
})

//////////////upload document/////////////
////file upload
const upload = require('express-fileupload')
app.use(upload())


app.get('/uploaddoc',(req,res)=>{
  Login.aggregate( [
  {
    $group: {
       _id:"$designation", //////////group by department//////
       count: { $sum: 1 }
    }
  }
]
,(err,result)=>{
    console.log(result);
    if(err)
    throw err;
    else if (result.lenght != 0) {
      Category.find((err,result1)=>{
        console.log(result1);
        if(err)
        throw err;
        res.render("uploaddoc",{data:result,category:result1,admin:req.session.admin,employee:req.session.employee})

      })
    }
})
})
///////////////add category for upload document///////////

//////////////create Category/////////

app.post('/addcategory',(req,res)=>{

  var uploadby=req.body.uploadby
  console.log(uploadby);
  var category=req.body.category

  var Category1=Category({
    categoryname:category,
    add_by:uploadby
  })
  Category1.save().then((data)=>{
    res.render('uploaddoc',{msg:"category added successfully",admin:req.session.admin,employee:req.session.employee})
  })
})

///////////////admin upload document///////
app.use(express.static('upload'))
var Document=require('./models/document')

app.post('/uploaddoc',(req,res)=>{
  console.log(req.files);
  if (req.files)
  {
    var uploadername=req.body.admin;
    var docname=req.body.pname;
    var category=req.body.cat;
    var department=req.body.department;
    var description=req.body.description;
    var comment=req.body.comment;
    var permissionformanager=req.body.manager;
    var permissionforhr=req.body.hr;
    var permissionforemployee=req.body.employee;
    var permissionforsupport=req.body.support;
var status='pending'
    var file=req.files.filename;
    var filename=file.name
    file.mv('./upload/'+filename,(err,result)=>{
      if(err)
      throw err;
      else {
        var newdata=Document({
          uploadby:uploadername,
          docname:docname,
          filename:filename,
          category:category,
          department:department,
          comment:comment,
          adminstatus:status,
          supportstatus:status,
          managerstatus:status,
          employeestatus:status,

          manager:permissionformanager,
          support:permissionforsupport,

          hr:permissionforhr,
          employee:permissionforemployee,
          description:description
        })
        newdata.save().then((data)=>{
          res.render('uploaddoc',{msg:'file uploaded successfully',admin:req.session.admin,employee:req.session.employee})
        })
      }
    })
  }
})

/////////////////show document by manager ,hr and employee   and authorizes or reject doccument////////////////////
///view doccument by admin/////
app.get('/viewdocumentbyadmin',(req,res)=>{

Document.find({},(err,result)=>{
  console.log(result);
  if(err)
  throw err;
  else
  res.render('viewdocument',{data:result,admin:req.session.admin})

})
})


////authorized  by admin/////
app.get('/authorizedbyadmin',(req,res)=>{

    var id=req.query.sid
  console.log(id);

  Document.updateOne({_id:id},{$set:{supportstatus:"authorized by admin"}},(err,result)=>{
      console.log(result);

      if(err)
      throw err;
      else if (result.nModified >0) {
        Document.find({support:"view"},(err,result1)=>{
          console.log(result1);

          if(err)
          throw err;
         else
          res.render('viewdocument',{data:result1, msg:"request authorized by admin",admin:req.session.admin})

  })
    }
    else {
      res.render('home',{ msg:"request fail.........",admin:req.session.admin})
    }
    })
  })

////////////doccument reject by admin////////////

app.get('/docrejectedbyadmin',(req,res)=>{

    var id=req.query.rejectid
  console.log(id);

  Document.updateOne({_id:id},{$set:{supportstatus:"reject by admin"}},(err,result)=>{
      console.log(result);
      if(err)
      throw err;
      else if (result.nModified >0) {
        Document.find({support:"view"},(err,result1)=>{
          console.log(result1);

          if(err)
          throw err;
         else
          res.render('viewdocument',{data:result1, msg:"request reject by admin",admin:req.session.admin})

  })
    }
    else {
      res.render('home',{ msg:"request fail.........",admin:req.session.admin})
    }
    })
  })

//////////////////////view doccument by  support /////////
app.get('/viewdocumentbysupport',(req,res)=>{

Document.find({support:"view",supportstatus:"authorized by admin"},(err,result)=>{
  console.log(result);
  if(err)
  throw err;
  else
  res.render('viewdocument',{data:result,support:req.session.support})

})
})

/////authorized  by support/////
app.get('/authorizedbysupport',(req,res)=>{

    var id=req.query.sid
  console.log(id);

  Document.updateOne({_id:id},{$set:{managerstatus:"authorized by support"}},(err,result)=>{
      console.log(result);

      if(err)
      throw err;
      else if (result.nModified >0) {
        Document.find({support:"view",supportstatus:"authorized by admin"},(err,result1)=>{
          console.log(result1);

          if(err)
          throw err;
         else
          res.render('viewdocument',{data:result1, msg:"request authorized by support",support:req.session.support})

  })
    }
    else {
      res.render('home',{ msg:"request fail.........",support:req.session.support})
    }
    })
  })

////////////doccument reject by support////////////

app.get('/docrejectedbysupport',(req,res)=>{

    var id=req.query.rejectid
  console.log(id);

  Document.updateOne({_id:id},{$set:{managerstatus:"reject by support"}},(err,result)=>{
      console.log(result);
      if(err)
      throw err;
      else if (result.nModified >0) {
        Document.find({support:"view" ,supportstatus:"authorized by admin"},(err,result1)=>{
          console.log(result1);

          if(err)
          throw err;
         else
          res.render('viewdocument',{data:result1, msg:"request reject by support",support:req.session.support})

  })
    }
    else {
      res.render('home',{ msg:"request fail.........",support:req.session.support})
    }
    })
  })

//////////view document by manager if authorized by support//////////

app.get('/viewdocumentbymanager',(req,res)=>{

Document.find({manager:"view",managerstatus:"authorized by support"},(err,result)=>{
  console.log(result);
  if(err)
  throw err;
  else
  res.render('viewdocument',{data:result,manager:req.session.manager})

})
})

//authorized or reject view doccument by employee//////////by manager///
/////authorized  by manager /////
app.get('/authorizedbymanager',(req,res)=>{

    var id=req.query.sid
  console.log(id);

  Document.updateOne({_id:id},{$set:{employeestatus:"authorized by manager"}},(err,result)=>{
      console.log(result);

      if(err)
      throw err;
      else if (result.nModified >0) {
        Document.find({manager:"view",managerstatus:"authorized by support"},(err,result1)=>{
          console.log(result1);

          if(err)
          throw err;
         else
          res.render('viewdocument',{data:result1, msg:"request authorized by manager",manager:req.session.manager})

  })
    }
    else {
      res.render('home',{ msg:"request fail.........",manager:req.session.manager})
    }
    })
  })

////////////doccument reject by manager////////////

app.get('/docrejectedbymanager',(req,res)=>{

    var id=req.query.rejectid
  console.log(id);

  Document.updateOne({_id:id},{$set:{employeestatus:"reject by manager"}},(err,result)=>{
      console.log(result);
      if(err)
      throw err;
      else if (result.nModified >0) {
        Document.find({manager:"view",managerstatus:"authorized by support"},(err,result1)=>{
          console.log(result1);

          if(err)
          throw err;
         else
          res.render('viewdocument',{data:result1, msg:"request reject by manager",manager:req.session.manager})

  })
    }
    else {
      res.render('home',{ msg:"request fail.........",manager:req.session.manager})
    }
    })
  })
/////////////////////
app.get('/viewdocumentbyemployee',(req,res)=>{

Document.find({employee:"view",employeestatus:"authorized by manager"},(err,result)=>{
  console.log(result);
  if(err)
  throw err;
  else
  res.render('viewdocument',{data:result,employee:req.session.employee})

})
})
/////////////view document uploaded by employee or admin///////
app.get('/viewdocumentUpload',(req,res)=>{
let user;
if (req.session.employee) {
  user=req.session.employee
}
else {
  user=req.session.admin

}
console.log(user);
Document.find({uploadby:user},(err,result1)=>{
  console.log(result1);
  if(err)
  throw err;
  else
  res.render('viewdocument',{data:result1,employee:req.session.employee,admin:req.session.admin})

})
})
/////////////search documents/////////////////////////
app.get('/searchdoc',(req,res)=>{
  res.render("searchdoc",{admin:req.session.admin})
})

app.get('/searchresult',(req,res)=>{
let searchby=req.query.searchby
let typethis=req.query.typethis

if (searchby=="department") {
  Document.find({department:typethis},(err,result)=>{
    console.log(result.length);
    if (err)
    throw err;
      else if (result.lenght != 0) {
      res.render("viewsearchresult",{data:result,admin:req.session.admin})
    }
    else{
      res.render("viewsearchresult", { msg:"no record found.....",admin:req.session.admin})
    }
  })
}
else if (searchby=="category") {
  Document.find({category:typethis},(err,result)=>{
    if (err)
    throw console.error(err);
    else if (result.lenght !=0) {
      res.render("viewsearchresult",{data:result,admin:req.session.admin})
    }
    else
    res.render("viewsearchresult",{msg:"no record found.....",admin:req.session.admin})
  })
}

else if (searchby=="docname") {
  Document.find({docname:typethis},(err,result)=>{
    if (err)
    throw console.error(err);
    else if (result.lenght !=0) {
      res.render("viewsearchresult",{data:result,admin:req.session.admin})
    }
    else{
      res.render("viewsearchresult",{msg:"no record found.....",admin:req.session.admin})

    }
  })
}
else if (searchby=="uploadby") {
  Document.find({uploadby:typethis},(err,result)=>{
    if (err)
    throw console.error(err);
    else if (result.lenght !=0) {
      res.render("viewsearchresult",{data:result,admin:req.session.admin})
    }
    else
    res.render("viewsearchresult",{msg:"no record found.....",admin:req.session.admin})
  })
}
else if (searchby=="filename") {
  Document.find({filename:typethis},(err,result)=>{
    if (err)
    throw console.error(err);
    else if (result.lenght !=0) {
      res.render("viewsearchresult",{data:result,admin:req.session.admin})
    }
    else
    res.render("viewsearchresult",{msg:"no record found.....",admin:req.session.admin})
  })
}
})

//////////add assets/////////////////////

app.post('/addasset',(req,res)=>{

  var assetid=req.body.aid
  var aqty=parseInt(req.body.aqty)
  var assettype=req.body.atype
  var astatus="available"
  var isto=''
for (var i = 1; i <=aqty; i++) {
  assetid='asset'+assetid+i;
  var Asset1=Asset({
    assetname:assettype,
    assetid:assetid,
    assetstatus:astatus,
    issuedto:isto

  })
  Asset1.save().then((data)=>{
    console.log(data);
    if (error) {
      throw(error);
    } else if(data.length !=0){
      console.log(i+"    added");
             }
           })
           assetid=req.body.aid
}

      res.render('home',{msg:'add assets successfully ',admin:req.session.admin})
     // console.log('Email sent: ' + info.response);
})



/////////////show assets/////////


app.get('/showasset',(req,res)=>{

  Asset.find((err,result)=>{
    console.log(result);

    if(err)
    throw err;
    else
    res.render('showassets',{data:result,admin:req.session.admin})

  })
})


////////// raise request assets by employee//////////////////
////////// raise request assets by manager//////////////////

app.get('/reqassetbyuser',(req,res)=>{
var user;
if (req.session.employee) {
  user= req.session.employee
}else
user= req.session.manager

console.log(user);
  Login.findOne({email:user},(err,result)=>{
    console.log(result);

    if(err)
    throw err;
    else
    res.render('raiserequest',{data:result, employee:req.session.employee , manager:req.session.manager})

  })
})





app.post('/reqasset',(req,res)=>{
  var user=req.body.user
  var support=req.body.support

  var assetid=req.body.aid
  var empid=req.body.empid

  var managerid=req.body.manid

  var assetname=req.body.atype
  var astatus;


  if (user==req.session.employee) {
     astatus=0;
  }else
  astatus=2;
  var Request1=Request({
    user:user,
    assetname:assetname,
    assetid:assetid,
    empid:empid,
    managerid:managerid,
    supportid:support,
    status:astatus

  })
  Request1.save().then((data)=>{
    console.log(data);
     if(data.length !=0){

      res.render('raiserequest',{msg:'request assets successfully ',employee:req.session.employee, manager:req.session.manager})
     // console.log('Email sent: ' + info.response);
   }

})
})

//////////////view employee all req. status//////////

app.get('/viewrequest',(req,res)=>{
  var user;
  if (req.session.employee) {
    user= req.session.employee
  }else
user= req.session.manager

console.log(user);

  Request.find({user:user,$or:[{status:0},{status:1},{status:2},{status:3},{status:4}]},(err,result)=>{
    console.log(result);

    if(err)
    throw err;
    else if (result.length != 0)
    {
      var requeststatus=result.map((rec)=>{
        if (rec.status==0)
        return "pending by manager";

        if (rec.status==1)
        return "reject by manager";
        else if (rec.status==2)
        return "pending by support";
        else if (rec.status==3)
        return "aproved by support";
       else if (rec.status==4)
        return "rejected by support";

      })
      var finaldata=result.map((rec,index)=>{
        var join={requeststatus:requeststatus[index]};
        var object={...rec,...join}
        return object;
  })
  console.log(finaldata);
  res.render('showreq',{data:finaldata, employee:req.session.employee,manager:req.session.manager})

  }
  else
  res.render('showreq',{msg:"no req found...", employee:req.session.employee,manager:req.session.manager})

  })
})
/////////////////////////show employee under same manager//////////
app.get('/showteammember',(req,res)=>{
var user= req.session.employee
  Login.findOne({email:user},(err,result)=>{
    console.log(result);
    if(err)
    throw err;
    else if (result.length != 0) {
      var manid=result.managerid
      Login.find({designation:"employee",managerid:manid},(err,result1)=>{
        console.log(result1);
           if (err)
           throw err;
           else {
             res.render('team',{data:result1, employee:req.session.employee , manager:req.session.manager})

           }
      })
  }
  })
})



/////////////aproved req for employee/////////

app.get('/empasset',(req,res)=>{

  var user;
  if (req.session.employee) {
    user= req.session.employee
  }else
  user= req.session.manager

  Request.find({status:3,user:user},(err,result)=>{

    console.log(result);

    if(err)
    throw err;
    else
    res.render('empasset',{data:result, employee:req.session.employee,manager:req.session.manager})

  })
})

///////////////////////////show all employee under manager//////////////

    app.get('/showemployeeUndermanager',(req,res)=>{
    var user;
    if (req.session.employee) {
      user= req.session.employee
    }else
    user= req.session.manager
    Login.findOne({email:user},(err,result)=>{
      console.log(">>>>>>>>>>"+result);
      if(err)
      throw err;
      else if (result.length !=0) {
        var manid =result.managerid
      Login.find({designation:"employee",managerid:manid},(err,result1)=>{
        console.log(result1);
        if(err)
        throw err;
        else
        res.render('employeeUndermanager',{data:result1, employee:req.session.employee , manager:req.session.manager})
    })
  }
      })
    })




/////////manager pendind req//////////
///view pendind req and approve and reject///////



app.get('/viewpendingreqbymanager',(req,res)=>{
  var user= req.session.manager
    Login.findOne({email:user},(err,result)=>{
      console.log(result);
      if(err)
      throw err;
      else if (result.length != 0) {
        var manid=result.managerid

  Request.find({managerid:manid,status:0},(err,result)=>{
    console.log(result);

    if(err)
    throw err;
    else
    res.render('pendingreq',{data:result, manager:req.session.manager})

  })
}
})
})

///////support pendindg req//////////
///view pendind req and approve and reject///////


app.get('/viewpendingreqbysupport',(req,res)=>{

  Request.find({status:2},(err,result)=>{
    console.log(result);

    if(err)
    throw err;
    else
    res.render('pendingreqbysupport',{data:result, manager:req.session.manager,support:req.session.support})

  })
})



app.get('/aprovedbymanager',(req,res)=>{
  var id=req.query.sid
console.log(id);

Request.updateOne({_id:id},{$set:{status:2}},(err,result)=>{
    console.log(result);

    if(err)
    throw err;
    else if (result.nModified >0) {
      Request.find({managerid:"m1",status:0},(err,result)=>{
        console.log(result);

        if(err)
        throw err;


    res.render('pendingreq',{data:result, msg:"request aproved by manager",manager:req.session.manager})
})
  }
  else {
    res.render('pendingreq',{data:result, msg:"req update fail..........",manager:req.session.manager})

  }
  })

})


/////////////reject req by manager////////

app.get('/rejectbymanager',(req,res)=>{
  var id=req.query.rejectid
console.log(id);

Request.updateOne({_id:id},{$set:{status:1}},(err,result)=>{
    console.log(result);

    if(err)
    throw err;
    else if (result.nModified >0) {
      Request.find({managerid:"m1",status:0},(err,result)=>{
        console.log(result);

        if(err)
        throw err;


    res.render('pendingreq',{data:result, msg:"request reject by manager",manager:req.session.manager})
})
  }
  else {
    res.render('pendingreq',{data:result, msg:"req update fail try again....",manager:req.session.manager})

  }
  })

})



app.get('/aprovedbysupport',(req,res)=>{
  var id=req.query.sid
console.log(id);

Request.updateOne({_id:id},{$set:{status:3}},(err,result)=>{
    console.log(result);

    if(err)
    throw err;
    else if (result.nModified >0) {
      Request.find({managerid:"m1",status:2},(err,result)=>{
        console.log(result);

        if(err)
        throw err;


    res.render('pendingreqbysupport',{data:result, msg:"request aproved by support",support:req.session.support})
})
  }
  else {
    res.render('pendingreqbysupport',{data:result, msg:"req update fail..........",support:req.session.support})

  }
  })

})


/////////////reject req by support////////

app.get('/rejectbysupport',(req,res)=>{
  var id=req.query.rejectid
console.log(id);

Request.updateOne({_id:id},{$set:{status:4}},(err,result)=>{
    console.log(result);

    if(err)
    throw err;
    else if (result.nModified >0) {
      Request.find({managerid:"m1",status:2},(err,result)=>{
        console.log(result)

        if(err)
        throw err;


    res.render('pendingreqbysupport',{data:result, msg:"request reject by support",support:req.session.support})
})
  }
  else {
    res.render('pendingreqbysupport',{data:result, msg:"req update fail try again....",support:req.session.support})

  }
  })

})


//////////////////////report by support for all aprover requests/////////////

app.get('/report',(req,res)=>{

  Request.find({status:3},(err,result)=>{
    console.log(result);

    if(err)
    throw err;
    else
    res.render('report',{data:result,support:req.session.support})

  })
})


////////////////asset transfer /////////////

app.get('/transfer',(req,res)=>{
var user;
if (req.session.employee) {
  user= req.session.employee
}else
user= req.session.manager

var uid=req.query.sid

console.log(user);
  Request.findOne({_id:uid},(err,result)=>{
    console.log(result);

    if(err)
    throw err;
    else
    res.render('transferasset',{data:result, employee:req.session.employee , manager:req.session.manager})

  })
})



app.post('/assettransfer',(req,res)=>{
  var uid=req.body.sid
  var fromuser=req.body.fromuser

  var touser=req.body.user

  var empid=req.body.empid
  var manid=req.body.manid
  var astatus;

    if (fromuser==req.session.employee) {
       astatus=0;
    }else
    astatus=2;

  Request.updateOne({_id:uid},{$set:{user:touser,empid:empid,managerid:manid,status:astatus}},(err,result)=>{
    console.log(result);

     if(err) throw err;
     else if (result.nModified >0)
     {
            if(err) throw err;
           res.render('home',{msg:' transfer successfull.........',employee:req.session.employee, manager:req.session.manager})
         }else {
           res.render('home',{msg:' transfer fail',employee:req.session.employee, manager:req.session.manager})

         }

         })
    })



    ////////////////assign task to employee by manager /////////////
/////get//////
    app.get('/assigntask',(req,res)=>{
  var user= req.session.manager

    var uid=req.query.uid

      Login.findOne({email:uid},(err,result)=>{
        console.log(result);

        if(err)
        throw err;
        else
        res.render('assigntask',{data:result, employee:req.session.employee , manager:req.session.manager})

      })
    })

//////////////post///////


app.post('/assigntask',(req,res)=>{
  var touser=req.body.touser
  var tname=req.body.tname
  var deadlinedate=req.body.date
  var description=req.body.description
  var manid=req.body.manid
  var status=0
  var completionstatus="open"
  var rating=0
  var Task1=Task({
    user:touser,
    taskname:tname,
    taskdescription:description,
    managerid:manid,
    status:status,
    deadlinedate:deadlinedate,
    completion_status:completionstatus,
    rating:rating
  })
  Task1.save().then((data)=>{
    console.log(data);
     if(data.length !=0){

      res.render('home',{msg:'task assign to  employee successfully ',manager:req.session.manager})
     // console.log('Email sent: ' + info.response);
}
})
})
////////////////////////////show assign task by manager//////////////
    app.get('/showtasks',(req,res)=>{
  var user= req.session.manager
      Login.findOne({email:user},(err,result)=>{
        console.log(result);
        if(err)
        throw err;
        else if (result.length != 0) {
          var manid=result.managerid

            Task.find({managerid:manid,$or:[{status:0},{status:1},{status:2},{status:3}]},(err,result)=>{
              console.log(result);

              if(err)
              throw err;
              else if (result.length != 0)
              {
                var requeststatus=result.map((rec)=>{
                  if (rec.status==0)
                  return "pending ";

                  if (rec.status==1)
                  return "unable to do";
                  else if (rec.status==2)
                  return "task in progress";
                  else if (rec.status==3)
                  return "completed..";

                })
                var finaldata=result.map((rec,index)=>{
                  var join={requeststatus:requeststatus[index]};
                  var object={...rec,...join}
                  return object;
            })
            console.log(finaldata);
            res.render('showtasks',{data:finaldata, employee:req.session.employee,manager:req.session.manager})

            }
            else
            res.render('showtasks',{msg:"no record found", employee:req.session.employee,manager:req.session.manager})

            })
          }
})
})

////////////////////////////////


    //////////////////////

/////////////////show task by employee///////////
app.get('/showemptask',(req,res)=>{
var user= req.session.employee

            Task.find({user:user,$or:[{status:0},{status:1},{status:2},{status:3}]},(err,result)=>{
              console.log(result);

              if(err)
              throw err;
              else if (result.length != 0)
              {
                var requeststatus=result.map((rec)=>{
                  if (rec.status==0)
                  return "pending ";

                  if (rec.status==1)
                  return "unable to do";
                  else if (rec.status==2)
                  return "task in progress";
                  else if (rec.status==3)
                  return "completed..";

                })
                var finaldata=result.map((rec,index)=>{
                  var join={requeststatus:requeststatus[index]};
                  var object={...rec,...join}
                  return object;
            })
            console.log(finaldata);
            res.render('showemptask',{data:finaldata, employee:req.session.employee,manager:req.session.manager})

            }
            else
            res.render('showemptask',{msg:"no record found", employee:req.session.employee,manager:req.session.manager})

            })
})

//////////////////////////////chnge final completion stataus open or close//////////////////

app.get('/completionstatus',(req,res)=>{
  var cid=req.query.cid
var finalstatus=req.query.fstatus
if (finalstatus==="close") {
finalstatus="open"
}else
finalstatus="close"
      Task.updateOne({_id:cid},{$set:{completion_status:finalstatus}},(err,result)=>{
        console.log(result);
           if (err)
           throw err;
           else {
             res.render('home',{msg:"status changed successfully..." ,employee:req.session.employee , manager:req.session.manager})

           }

      })
})

////////////////////////for givr rating to employee on task performance/////////////
app.get('/rating',(req,res)=>{
  var rid=req.query.rid
  Task.findOne({_id:rid},(err,result)=>{
    console.log(result);
    if (err)
    throw err;
    else
    res.render('rating',{data:result,employee:req.session.employee , manager:req.session.manager})

  })
})


app.post('/rating',(req,res)=>{
  var rid=req.body.rid
console.log(rid);
  var rating=req.body.rate
      Task.updateOne({_id:rid},{$set:{rating:rating}},(err,result)=>{
        console.log(result);
           if (err)
           throw err;
           else if (result.nModified >0) {
             res.render('home',{msg:"rating  save successfully..." ,employee:req.session.employee , manager:req.session.manager})

           }else{
             res.render('home',{msg:"rating  save fail,,,,,,,..." ,employee:req.session.employee , manager:req.session.manager})

           }

      })
})


////////////////////////for give status of project  by employee /////////////
app.get('/taskstatusbyemp',(req,res)=>{
  var sid=req.query.sid
  Task.findOne({_id:sid},(err,result)=>{
    console.log(result);
    if (err)
    throw err;
    else
    res.render('taskstatus',{data:result,employee:req.session.employee , manager:req.session.manager})

  })
})


app.post('/taskstatusbyemp',(req,res)=>{
  var rid=req.body.sid
console.log(rid);
  var status=req.body.status
      Task.updateOne({_id:rid},{$set:{status:status}},(err,result)=>{
        console.log(result);
           if (err)
           throw err;
           else if (result.nModified >0) {
             res.render('home',{msg:" task status changed successfully..." ,employee:req.session.employee , manager:req.session.manager})

           }else{
             res.render('home',{msg:"status changed  fail,,,,,,,..." ,employee:req.session.employee , manager:req.session.manager})

           }

      })
})

///////////////////sent and view messages////////////////

app.get('/sendmail',(req,res)=>{
var user;
if (req.session.employee) {
   user= req.session.employee
}else
user= req.session.manager

  Login.findOne({email:user},(err,result)=>{
    console.log(result);

    if(err)
    throw err;
    else
    res.render('sentmsg',{data:result, employee:req.session.employee , manager:req.session.manager})

  })
})

//////////////post///////


app.post('/sentmail',(req,res)=>{

  var fromuser=req.body.frommail
var touser=req.body.tomail
var sub=req.body.sub
var msg=req.body.msg

var Mail1=Mail({
touser:touser,
fromuser:fromuser,
subject:sub,
massage:msg
})
Mail1.save().then((data)=>{
console.log(data);
 if(data.length !=0){

  res.render('home',{msg:'mail sent successfully ',manager:req.session.manager,employee:req.session.employee})
 // console.log('Email sent: ' + info.response);
}
})
})


//////////view recieved mails or messages..by manager

app.get('/viewmails',(req,res)=>{

var user= req.session.manager

  Login.findOne({email:user},(err,result)=>{
    console.log(result);

    if(err)
    throw err;
    else if( result.length !=0)
    {
      manid=result.managerid
      Mail.find({touser:manid},(err,result1)=>{
console.log(result1);
            if(err)
            throw err;
        else
        res.render('viewmsg',{data:result1, employee:req.session.employee , manager:req.session.manager})

      })
    }
  })
})


//////////////////view  recieved msg  of employee////////

app.get('/viewempmails',(req,res)=>{

var user= req.session.employee

  Login.findOne({email:user},(err,result)=>{
    console.log(result);

    if(err)
    throw err;
    else if( result.length !=0)
    {
      manid=result.employeeid
      Mail.find({touser:manid},(err,result1)=>{
console.log(result1);
            if(err)
            throw err;
        else
        res.render('viewmsg',{data:result1, employee:req.session.employee , manager:req.session.manager})

      })
    }
  })
})

//////// /////// show completion status of employee by managerid/////////
app.get('/showcompletionstatus',(req,res)=>{
  var sid=req.query.sid
  ////////for totaltask done by employee  result.lenght/////////
  console.log(sid);
  Task.find({user:sid},(err,result)=>{
    if(err)
    throw err;
    else if (result.length != 0) {
      var manid=result[0].managerid
console.log(manid);
////////for total completedtask done by employee  result1.lenght/////////
Task.find({status:3,user:sid,managerid:manid},(err,result1)=>{
  console.log(result1);
  if(err)
  throw err;
  else if (result1.length >= 0) {

    ////////for total incompletedtask done by employee  result2.lenght/////////

    Task.find({user:sid,managerid:manid,$or:[{status:0},{status:1},{status:2}]},(err,result2)=>{
          console.log(result2);
          if(err)
          throw err;
          else if (result2.length >= 0)
          {
             function completionpercentage() {
              var totalpercentage=  (result1.length/result.length)*100
              return totalpercentage;
                            }

             var status={
                    user:sid,
                    totaltask:result.length,
                    completed:result1.length,
                    incompleted:result2.length,
                    calulation:completionpercentage()

                     }
             console.log(status);
        res.render('empcompletionstatus',{total:status, employee:req.session.employee,manager:req.session.manager})
        }

        else
        res.render('empcompletionstatus',{msg:"no record found", employee:req.session.employee,manager:req.session.manager})

        })
      }
})
}
})
})
