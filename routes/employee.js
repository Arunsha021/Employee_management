var express=require('express')
var router=express.Router()
var pool=require("./pool")
var upload=require("./multer")
var fs = require('fs');
var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');

router.get('/employeeinterface', function(req, res, next){
  try{
  var admin=JSON.parse(localStorage.getItem('ADMIN')) 
  if (admin==null)
      { 
        res.render('adminlogin',{'message':' '});
        
      } 
  res.render('employeeinterface',{status:null});
  }catch(e)
  {
    res.render('adminlogin',{'message':' '});
  }
  });
router.post('/submit_employee_record',upload.single('picture'),function(req,res){
console.log("BODY:",req.body)
console.log("FILE:",req.file)
var name=req.body.firstname+" "+req.body.lastname
var dob=new Date(req.body.dob)
pool.query('insert into employees(employeename, dob, gender, address, state, city, emailaddress, contactnumber, picture)values(?,?,?,?,?,?,?,?,?)',[name,req.body.dob,req.body.gender,req.body.address,req.body.state,req.body.city,req.body.emailaddress,req.body.contactnumber,req.file.filename],function(error,result){
 if(error)
 {
  console.log(error);
  res.render('employeeinterface',{status:0})
 }
else
{ console.log("RESULT:"+result)
  res.render('employeeinterface',{status:1})
}

})


})
 
router.get('/display_all_employee', function(req, res, next) {
  try{
    var admin=JSON.parse(localStorage.getItem('ADMIN'))  

    if (admin==null)
      { 
        res.render('adminlogin',{'message':' '});
        
      } 
    
pool.query('select E.*,(select S.statename from States S where S.stateid=E.state) as sname,(select C.cityname from Cities C where C.cityid=E.city) as cname from employees E',function(error,result){
  if(error)
  {
    res.render("displayemployee",{status:false,result:[]})
  }
 else
 {
  res.render("displayemployee",{status:true,result:result})
 }


})
}catch(e)
{
  res.render('adminlogin',{'message':' '});
}
 
});

router.get('/display_by_id', function(req, res, next) {
  pool.query('select E.*,(select S.statename from States S where S.stateid=E.state) as sname,(select C.cityname from Cities C where C.cityid=E.city) as cname from employees E where E.employeeid=?',[req.query.eid],function(error,result){
    if(error)
    {
      res.render("displaybyid",{status:false,result:[]})
    }
   else
   {
    res.render("displaybyid",{status:true,result:result[0]})
   }
  
  
  })
  
   
  });
  

  router.post('/edit_employee_record',function(req,res){
 
   if(req.body.action=='Edit')
   {   
    var name=req.body.firstname+" "+req.body.lastname
    var dob=new Date(req.body.dob)
    pool.query('update employees set employeename=?, dob=?, gender=?, address=?, state=?, city=?, emailaddress=?, contactnumber=? where employeeid=?',[name,dob,req.body.gender,req.body.address,req.body.state,req.body.city,req.body.emailaddress,req.body.contactnumber,req.body.employeeid],function(error,result){
     if(error)
     {
      console.log(error);
      res.redirect('/employee/display_all_employee')
     }
    else
    {  res.redirect('/employee/display_all_employee')
    }
    
    })
  }
  else
  {

    pool.query('delete from employees  where employeeid=?',[req.body.employeeid],function(error,result){
      if(error)
      {
       console.log(error);
       res.redirect('/employee/display_all_employee')
      }
     else
     {  res.redirect('/employee/display_all_employee')
     }
 
    })

  }
})


router.get('/display_picture', function(req, res, next) {
  res.render('displaypicture', {eid: req.query.eid,ename:req.query.ename,picture:req.query.picture });
});



router.post('/edit_employee_picture',upload.single('picture'),function(req,res){
  console.log("BODDDDDY",req.body)
  
  pool.query('update employees set  picture=? where employeeid=?',[req.file.filename,req.body.employeeid],function(error,result){
   if(error)
   {
    console.log(error);
     res.redirect('/employee/display_all_employee')
   }
  else
  { 
    var filePath = 'I:/employeemanagement/public/images/'+req.body.oldpicture; 
    try{
      fs.unlinkSync(filePath);
    }
    catch(error)
    {
      
    }

    res.redirect('/employee/display_all_employee')

  }
  
  })
  
  
  })
   






  module.exports = router;