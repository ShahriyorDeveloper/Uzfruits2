const mongoose = require('mongoose')

const contactcourseSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phoneNumber: {
      type: String,
      required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('ContactCourse', contactcourseSchema)