const User=require('../model/userModel')


exports.islogout= (req, res, next)=>{
    if(!req.session.user){
        next()
    }
    else{
        res.redirect('/')
    }
}


exports.islogged=(req,res,next)=>{
    if(req.session.user){     
        next()
    }
    else{
        res.redirect('/login')
    }
}


exports.isAdminLogout= (req,res,next)=>{
    if(!req.session.admin){
        next()
    }
    else{
        res.redirect('/admin/dashboard')
    }
}


exports.isAdminlogged= (req,res,next)=>{
    if(req.session.admin){
        next()
    }
    else{
        res.redirect('/admin')
    }
}