const mongoose = require('mongoose')

const ProductSchema = mongoose.Schema(
    {
        name:{
            type:String,
            required: [true,'Please enter a product name.']
        },
        qty:{
            type:Number,
            required:true,
            default:0
        },
        price:{
            type:Number,
            required:true,
            default:0
        },
      
        
    }
)

const newProduct = mongoose.model('Product',ProductSchema)
module.exports = newProduct;