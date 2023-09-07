const mongoose = require('mongoose'); 

const categorySchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique:true
    },
    image:String,
    isDestroyed:{
        type:Boolean,
        default:false
    }
})

const Category = mongoose.model('Category',categorySchema);
module.exports = Category;