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

/////////////chang password for all/////////////

app.get('/changepass',(req,res)=>{

  res.render('changepass', {admin:req.session.admin,employee:req.session.employee,manager:req.session.manager,support:req.session.support})

})


app.post('/changepass',(req,res)=>{
  var uid=req.body.uid
  var cpwd=req.body.cpwd
  var npwd=req.body.npwd
var session=req.session.user

Login.updateOne({email:uid,password:cpwd},{$set:{password:npwd}},(err,result)=>{
   if(err) throw err;
   else
         res.render('changepass',{msg:' passsword changed successfully',admin:req.session.admin,employee:req.session.employee,manager:req.session.manager,support:req.session.support})
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

/////////////aproved req for employee/////////

app.get('/empasset',(req,res)=>{

  var user;
  if (req.session.employee) {
    user= req.session.employee
  }else
  user= req.session.manager

  Request.find({managerid:"m1",status:3,user:user},(err,result)=>{

    console.log(result);

    if(err)
    throw err;
    else
    res.render('empasset',{data:result, employee:req.session.employee,manager:req.session.manager})

  })
})





/////////manager pendind req//////////
///view pendind req and approve and reject///////



app.get('/viewpendingreqbymanager',(req,res)=>{

  Request.find({managerid:"m1",status:0},(err,result)=>{
    console.log(result);

    if(err)
    throw err;
    else
    res.render('pendingreq',{data:result, manager:req.session.manager})

  })
})

///////support pendindg req//////////
///view pendind req and approve and reject///////


app.get('/viewpendingreqbysupport',(req,res)=>{

  Request.find({managerid:"m1",status:2},(err,result)=>{
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
