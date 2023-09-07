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
        res.render('user/index',{ products,categories, success:req.flash('success') })
    } catch (error) {
        console.log(error.message)
    }
}


// insert form data into database as an user
exports.insertUser=async (req,res)=>{
    try {
        const {password,Cpassword}=req.body
        if(password !== Cpassword){
            return res.render('user/register',{error:'confirm password must be same as password'})
        }
        const userExists=await User.findOne({email:req.body.email}) 
        if(userExists){
          return res.render('user/register',{error:'user already exists'})
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
        req.user = userData
        //otp
        if(userData){
            const options={
                from:process.env.EMAIL,
                to:req.body.email,
                subject:'elegant seats verification otp',
                html:`<center> <h2>Verify Your Email </h2> <br> <h5>OTP :${otp} </h5><br><p>This otp is only valid for 1 minutes only</p></center>`
            }
            req.session.user=user._id
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
        const user = await User.findOne({email:Email}) //validate email
        
        if(!user){
            return res.render('user/login',{ error:'User not found' })
        }
        const isMatch = await bcrypt.compare(password, user.password)  //validate password
        if (!isMatch){ 
            return res.render('user/login',{ error:'password is invalid' })
        }
        
        if(user){
            
            if(user.blocked){
                res.render('user/login',{error:'Sorry,you are blocked by the admin'})
            }else{
                req.session.user=user._id
                res.redirect('/')
            }
        }
    }catch (error) {
        console.log(error.message);
    }
}

exports.resendOtp=async (req,res)=>{
    try {
        const userId=req.session.user
        const newOtp =randomString.generate({
            length:4,
            charset:'numeric'
        })
        await User.findByIdAndUpdate(userId,{otp:newOtp})
        const user=await User.findById(userId)
        const options = {
            from: process.env.EMAIL,
            to: user.email, // Use the user's email stored in the database
            subject: 'elegant seats verification otp',
            html: `<center> <h2>Verify Your Email</h2> <br> <h5>OTP :${newOtp} </h5><br><p>This OTP is only valid for 1 minute</p></center>`
        }
        
        await email.sendMail(options)
        res.redirect('/verifyOtp')
    } catch (error) {
        console.log(error.message)
    }
}

        
exports.showVerifyOtp= (req,res)=>{
    res.render('user/validOtp',{error:req.flash('error')})
}

exports.verifyOtp=async (req,res)=>{
    const otp =req.body.otp
    try {
        const user = await User.findOne({otp})
        if(!user){
            req.flash('error', 'invalid Otp');
            res.redirect('/verifyOtp')
        }
        else{
            const isVerified=await User.findOneAndUpdate({_id:user._id},{$set:{verified:true}},{new:true})
            if(isVerified.verified){
                req.flash('success','user verification completed successfully')
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
        let totalPages=await Products.find({}).count()
        totalPages=Math.ceil(totalPages/6)
        const pageNumber=req.body.pageNumber || 0
        const products=await Products.find({}).skip(pageNumber*6).limit(6)
        res.render('user/shop',{products,totalPages})
    } catch (error) {
        console.log(error.message)
    }
}

exports.searchProduct=async (req,res)=>{
    const { q } = req.query
    try {
        let products;
        if (q) {
            products = await Products.find({ name: { $regex: '.*' + q + '.*' }, softDeleted: 0 })
        } else {
            products=await Products.find({ softDeleted: 0 })   // Fetch all users from the database
        }
        res.render('user/shop',{products})
    } catch (error) {
        console.log(error.message)
    }
  }
// exports.showShop=async (req,res)=>{
//     var itemsPerPage = 6
//     try {
//         const myProducts=await Products.find({})
//         var products=[] 
//         await Products.aggregate([
//             {
//               $unwind: '$images', // Unwind the images array
//             },
//             {
//               $group: {
//                 _id: null, // Group all results into a single group
//                 allImagePaths: {
//                   $push: '$images', // Push each image path into an array
//                 },
//               },
//             },
//             {
//               $project: {
//                 _id: 0, // Exclude the _id field from the result
//                 allImagePaths: 1, // Include the allImagePaths field
//               },
//             },
//           ]).exec()
//           .then((result) => {
//             const allImagePaths = result[0].allImagePaths
//             products=allImagePaths
//           })
//           .catch((error) => {
//             console.error(error);
//           })
        

//         const page = req.query.page || 1; // Get the current page from the query parameter
//         const startIndex = (page - 1) * itemsPerPage;
//         const endIndex = startIndex + itemsPerPage;
//         const displayedProducts = products.slice(startIndex, endIndex);
       
//         const totalPages = Math.ceil(products.length / itemsPerPage);
//         res.render('user/shop', { myProducts, products: displayedProducts, currentPage: +page, totalPages });
//     }
//     catch (error) {
//        console.log(error.message)
//     }
// }

    


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
    req.session.user=null
    res.redirect('/')
}
    








