const mongoose = require('mongoose')

const contactSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phoneNumber: {
      type: String,
      required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    text: {
      type: String,
      // required: true
  },
})

module.exports = mongoose.model('Contact', contactSchema)