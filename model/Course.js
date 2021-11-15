const mongoose = require('mongoose')

const courseSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    courseDate: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        default: '',
    },
    text: {
        type: String,
        default: '',
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        // required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Course', courseSchema)