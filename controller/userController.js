const User=require('../model/userModel')
const Products=require('../model/productModel')
const Category=require('../model/categoryModel')
const bcrypt=require('bcrypt')
require('dotenv').config()
const email=require('../util/email')
const randomString=require('randomstring')




//hashing  password 
const securePassword=async (password)=>{
    try {
        const passwordHash=await bcrypt.hash(password, 10)
        return passwordHash
    } catch (error) {
        console.log(error.message)
    }
}

exports.showLogin= (req,res)=>{res.render('user/login')}
exports.showRegister= (req,res)=>{res.render('user/register')}

exports.showHome=async(req,res)=>{
    try {
        const products=await Products.find({})
        const categories=await Category.find({})
        res.render('user/index',{ products,categories })
    } catch (error) {
        console.log(error.message)
    }
}


// insert form data into database as an user
exports.insertUser=async (req,res)=>{
    try {
        const userExists=await User.findOne({email:req.body.email}) 
        if(userExists){
          return res.render('user/register')
        }
        const secpassword=await securePassword(req.body.password)
        const otp =randomString.generate({
            length:4,
            charset:'numeric'
        })
        const user=new User({
            name:req.body.name,
            email:req.body.email,
            password:secpassword,
            mobile:req.body.mobile,
            otp:otp
        })
        const userData=await user.save()
        //otp
        if(userData){
            const options={
                from:process.env.EMAIL,
                to:req.body.email,
                subject:'elegant seats verification otp',
                html:`<center> <h2>Verify Your Email </h2> <br> <h5>OTP :${otp} </h5><br><p>This otp is only valid for 5 minutes only</p></center>`
            }
            await email.sendMail(options)
            res.redirect('/verifyOtp')
        }else{
            res.render('user/register',{error:'your registration has been failed'})
        }
    } catch (error) {
        console.log(error.message)
    }
}

exports.validlogin = async (req, res)=>{
    const {Email,password}=req.body
    try {
        const user = await User.findOne({Email}) //validate email
        const otp=user.otp
        if(!user){
            return res.render('user/login',{ error:'User not found' })
        }
        const isMatch = await bcrypt.compare(password, user.password)  //validate password
        if (!isMatch){ 
            return res.render('user/login',{ error:'password is invalid' })
        }
        //otp
        if(user){
            const options={
                from:process.env.EMAIL,
                to:req.body.email,
                subject:'elegant seats verification otp',
                html:`<center> <h2>Verify Your Email </h2> <br> <h5>OTP :${otp} </h5><br><p>This otp is only valid for 5 minutes only</p></center>`
            }
            await email.sendMail(options)
            res.redirect('/verifyOtp')
        }
    }catch (error) {
        console.log(error.message);
    }
}
        
        
        


exports.showVerifyOtp= (req,res)=>{
    res.render('user/validOtp')
}

exports.verifyOtp=async (req,res)=>{
    const otp =req.body.otp
    try {
        const user = await User.findOne({otp})
        if(!user){
            // req.flash('error','invalid otp')
            res.redirect('/verifyOtp')
        }
        else{
            const isVerified=await User.findOneAndUpdate({_id:user._id},{$set:{verified:true}},{new:true})
            if(isVerified.verified){
                req.session.user=user._id
                res.redirect('/')
            }
            else{
                res.redirect('/verifyOtp')
            }
        }
        
    } catch (error) {
        console.log(error.message)
    }
}



//products 

exports.showShop=async (req,res)=>{
    try {
        res.render('user/shop')
    } catch (error) {
        console.log(error.message)
    }
}

exports.showSingle=async (req,res)=>{
   
    try {
        const product=await Products.findOne({_id:req.params.id})
        const category=await Category.findOne({_id:product.category})
        res.render('user/singleView',{product,category})
    } catch (error) {
        console.log(error.message)
    }
}
   


//logout

exports.logout= (req,res)=>{
    req.session.destroy()
    res.redirect('/')
}
    








