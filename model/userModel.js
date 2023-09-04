const mongoose =require('mongoose')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required: true
    },
    password:{
        type:String,
        required:true
    },
    profile:{
        type:String
    },
    cart:[{
        productId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Products',
        },
        quantity:{
            type : Number,
            default: 1
        },
        productPrice:{
            type: Number,
            required : true
        },
        discountPrice:{
            type : Number,
            required : true
        }
    }],
    wishlist:[{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'Products'
    }],
    address:Array,
    blocked :{
        type:Boolean,
        default:false
    },
    otp:{
        type:Number,
        createdAt:{type:Date,expires:'5m',default: Date.now()}
    },
    verified: {
        type:Boolean,
        default:false
    }
})

module.exports=mongoose.model('User',userSchema)