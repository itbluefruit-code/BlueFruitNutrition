import mongoose, { Schema, model } from "mongoose";


const reviewSchema = new Schema({
  comment: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 500
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },


  idClient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
 
  idProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Products',  
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});


export default model("Review", reviewSchema);