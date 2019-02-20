const mongoose = require ('mongoose');

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  categories: {
    type: [String],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  createDate: {
    type: String,
    default: Date.now
  },
  likes: {
    type: Number,
    default: 0
  },
  // property === path
  // ref('User') === model
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true  ,
    ref: 'User'
  },
  messages: [{
    messgaeBody: {
      type: String,
      required:true
    },
    messageDate: {
      type: Date,
      default: Date.now
    },
    messageUser: {
      type: mongoose.Schema.Types.ObjectId,
      required:true,
      ref: 'User'
    }
  }]

});

module.exports = mongoose.model( 'Post', PostSchema );
