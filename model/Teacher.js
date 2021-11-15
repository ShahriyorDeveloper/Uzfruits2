const mongoose = require('mongoose')

const teacherSchema = mongoose.Schema({
  name: {
      type: String,
      required: true
  },
  image: {
    type: String
  },
  text: {
    type: String,
    required: true
  },
  telegram: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  instagram: {
    type: String,
    default: 'https://www.instagram.com/'
  },


})

module.exports = mongoose.model('Teacher', teacherSchema)