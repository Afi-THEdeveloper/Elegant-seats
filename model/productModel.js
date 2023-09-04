const mongoose = require('mongoose'); 

const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true,
    },
    stock:{
        type:Number,
        required:true,
    },
    images:[String],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    softDeleted:{
        type:Boolean,
        default:false
    }
})

const Product = mongoose.model('Product', productSchema);
module.exports = Product; 