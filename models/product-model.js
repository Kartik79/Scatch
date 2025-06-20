const mongoose=require('mongoose');

const productSchema=mongoose.Schema({
    image:Buffer,
    name:String,
    price:Number,
    discount: {
        type:Number,
        default:0
    },
    quantity: {
        type:Number,
        default:1
    },
    bgcolor:String,
    panelcolor:String,
    textcolor:String,
});

module.exports=mongoose.model('product',productSchema);