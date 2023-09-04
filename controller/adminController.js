const Admin = require("../model/adminModel");
const Product = require("../model/productModel");
const Category = require("../model/categoryModel");
const User=require('../model/userModel')
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const { Console } = require("console");

//login 
exports.showLogin = (req, res) => {
  res.render("Admin/login");
}

exports.verifyAdminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (admin) {
      const passwordMatch = await bcrypt.compare(password, admin.password);
      if (passwordMatch) {
        req.session.admin = admin._id;
        res.redirect("/admin/dashboard");
      } else {
        res.render("Admin/login", { error: "password is invalid" });
      }
    } else {
      res.render("Admin/login", { error: "email is invalid" });
    }
  } catch (error) {
    next(error);
  }
}

exports.showDashboard = (req, res) => {
    res.render("Admin/dashboard");
}
  
//category managment
exports.ShowCategory = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.render("Admin/categories/index", { categories });
  } catch (error) {
    console.log(error.message);
  }
};


exports.showAdd = (req, res) => {
  res.render("Admin/categories/new");
};

exports.CreateCategory = async (req, res) => {
  try {
    const { name, photo } = req.body;
    if (name.length === 0 || photo.length === 0)
      return res.render("admin/categories/new", {
        error: "Name and Photo are required fields.",
      });
    await Category.create({
      name,
      image: "/category/" + photo,
    });
    // req.flash('success','Category Added successfully')
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
  }
};

exports.showEdit = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.findById(id);
    res.render("Admin/categories/edit", { category });
  } catch (error) {
    console.log(error.message);
  }
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, photo } = req.body;
  try {
    const category = await Category.findById(id);
    let updatedObj = {
      name,
    };
    if (typeof photo !== "undefined") {
      fs.unlink(path.join(__dirname, "../public", category.image), (err) => {
        if (err) console.log(err);
      });
      updatedObj.image = "/category/" + photo;
    }

    await category.updateOne(updatedObj);
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
  }
};

exports.destroyCategory = async (req, res) => {
  const id = req.body.id;
  const state = Boolean(req.body.state);
  try {
    const category = await Category.findByIdAndUpdate(
      id,
      { $set: { isDestroyed: state } },
      { new: true }
    );
    return res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
  }
}



//products managment
exports.showProducts= async (req,res)=>{
    const products = await Product.find({}).populate('category')
    console.log(products)
    res.render('Admin/products/products',{products})
}

exports.showAddProduct= async (req,res) => {
    const categories = await Category.find({})
    res.render('Admin/products/new', { categories })
}

exports.createProduct = async (req, res) => {
    const { name, description, price, images, stock, category } = req.body
    const imagesWithPath = images.map(img => '/products/' + img)
    try {
        const product = await Product.create({
            name,
            description,
            stock,
            price,
            category,
            images: imagesWithPath,
        })

        res.redirect('/admin/products')
    } catch (error) {
        console.log(error.message)
    }
}

exports.showEditProduct=async (req,res)=>{
    const {id}= req.params
    try {
        const product=await Product.findById(id)
        const category=await Category.find({})
        res.render('Admin/products/edit',{ product,category })
    } catch (error) {
        console.log(error.message)
    }
}

exports.destroyProduct = async (req, res) => {
    const id = req.body.id;
    const state = Boolean(req.body.state);
    try {
      const category = await Product.findByIdAndUpdate(
        id,
        { $set: { softDeleted: state } },
        { new: true }
      );
      return res.redirect("/admin/products");
    } catch (error) {
      console.log(error.message);
    }
}




//users managment
exports.showUsers=async (req,res)=>{
     
    try {
        const users=await User.find({})
        res.render('Admin/users/usersTable',{users}) 
    } catch (error) {
        console.log(error.message)
    }
}


exports.blockUser=async (req,res)=>{
  const id=req.body.id
  const state=Boolean(req.body.state)
  try {
    const users=await User.findByIdAndUpdate(id,{$set:{ blocked:state}},{new:true})
    res.redirect('/admin/users')  
  } catch (error) {
    console.log(error.message)
  }
}




exports.logout= (req,res)=>{
  req.session.destroy()
  res.redirect('/admin')
}

