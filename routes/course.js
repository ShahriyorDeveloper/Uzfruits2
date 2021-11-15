const express = require('express');
const Course = require('../model/Course');
const router = express.Router();
const mw = require('../middleware/mw')
const multer = require('multer');
const Category = require('../model/Category');
const Teacher = require('../model/Teacher');
const Contact = require('../model/Contact');
const ContactCourse = require('../model/ContactCourse');

//Rasm yuklash //
const image_storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/img/course/')
  },
  filename: function (req, file, cb) {
    const image_fileName = file.originalname.split(' ').join('-')
    cb(null, `${image_fileName}`)
  }
})
const image_uploadOptions = multer({ storage: image_storage })
const cpUpload = image_uploadOptions.fields([{ name: 'audio', maxCount: 1 }, { name: 'image', maxCount: 1 }])



/* Bosh sahifa. */
router.get('/', async (req, res, next) =>{
  const headercourse = await Category.aggregate([
        {
          $lookup : {
            from: 'courses',
            localField: '_id',
            foreignField: 'category',
            as: 'course'
          }
        }
      ])

  const categoryList = await Category.find()
  const courseList = await Course.find().populate('category teacher').limit(3)
  const coursesCount = await Course.countDocuments((count) => count)
  const teachersCount = await Teacher.countDocuments((count) => count)

  res.render('index', {
    title: "Bosh sahifa",
    categoryList, courseList, coursesCount, teachersCount, headercourse
  })
});



// router.get('*', async (req, res, next) =>{
//   const headercourse = await Category.aggregate([
//     {
//       $lookup : {
//         from: 'courses',
//         localField: '_id',
//         foreignField: 'category',
//         as: 'course'
//       }
//     }
//   ])
//   res.render('includes/header', {
//     headercourse
//   })
// })



/* Kurslar sahifasi. */
router.get('/kurslar', async (req, res, next) =>{
  const headercourse = await Category.aggregate([
    {
      $lookup : {
        from: 'courses',
        localField: '_id',
        foreignField: 'category',
        as: 'course'
      }
    }
  ])
  const categoryList = await Category.find()
  const TeacherList = await Teacher.find()
  const courseList = await Course.find().populate('category teacher')
  res.render('course', {
    title: 'Товары',
    categoryList, courseList, TeacherList, headercourse
})
});


/* Kurs qo'shish sahifasi. */
router.get('/kurslar/add', mw, async (req, res, next) => {
  const headercourse = await Category.aggregate([
    {
      $lookup : {
        from: 'courses',
        localField: '_id',
        foreignField: 'category',
        as: 'course'
      }
    }
  ])
  const teachersList = await Teacher.find()
  const categoryList = await Category.find()
  res.render('courseAdd', {title: 'Kurs yaratish', categoryList, teachersList, headercourse});
});



/* Bitta musiqa sahifasi. */
router.get('/kurslar/:id', async(req, res, next) => {
  const headercourse = await Category.aggregate([
    {
      $lookup : {
        from: 'courses',
        localField: '_id',
        foreignField: 'category',
        as: 'course'
      }
    }
  ])
  const categoryList = await Category.aggregate([
    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "category",
        as: "kurslar"
      }
    },
    {
      $project: {
        _id: "$_id",
        name: "$name",
        kurslar: {
          $size: "$kurslar"
        }
      }
    }
  ])

  Course.findById(req.params.id, (err, course) => {
    console.log(course, categoryList);
    res.render('courseDetails', {
      title: 'Kurs haqida',
      course,
      categoryList,
      headercourse
    });
  }).populate('category teacher')
});

/* post users listing. */
router.post('/kurslar/edit', function(req, res, next) {
  console.log('Kursni yangilash');
});



/* Post metodi orqali musiqa qo'shish. */
router.post('/kurslar/add', mw, cpUpload, async(req, res, next) =>{

  req.checkBody('name', 'kurs nomi kiritilmadi').notEmpty()
  // req.checkBody('teacher', "o'qituvchi tanlanmadi").notEmpty()
  req.checkBody('courseDate', 'kurs vaqtini belgilang').notEmpty()
  req.checkBody('text', 'matn kiritilmadi').notEmpty()
  req.checkBody('category', "Bo'limlardan birini tanlashingiz kerak").notEmpty()

  const errors = req.validationErrors()
  if(errors){
    res.render('courseAdd',  {
      title: "Kurs yaratishda hatolik bor",
      errors : errors
    })
  }else{
    // const basePath = `${req.protocol}://${req.get('host')}/public/uploads/audios/`;
    const category = await Category.findById(req.body.category)
    if(!category) return res.status(400).send('Invalid category')
    // const teacher = await Teacher.findById(req.body.teacher)
    // if(!teacher) return res.status(400).send('Invalid teacher')

    const course = new Course()

    course.name = req.body.name
    // course.teacher = req.body.teacher
    course.courseDate = req.body.courseDate
    // course.audio = req.files.audio[0].filename
    course.image = req.files.image[0].filename
    course.category = req.body.category
    course.text = req.body.text
    
  
    course.save((err) => {
      if(err) console.log(err);
      else{
        req.flash('alert alert-success', 'Kurs yaratildi')
        res.redirect('/kurslar')
      }
    })
  }
});




/* Id orqali musiqani o'zgartirish sahifasi rasmsiz. */
router.get('/kurslar/edit/:id', mw, async (req, res, next) => {
  const headercourse = await Category.aggregate([
    {
      $lookup : {
        from: 'courses',
        localField: '_id',
        foreignField: 'category',
        as: 'course'
      }
    }
  ])
  const categoryList = await Category.find()
  const teachersList = await Teacher.find()
  Course.findById(req.params.id, (err, course) => {
    console.log(course);
    res.render('courseEdit', {
      title: 'Kursni tahrirlash',
      course,
      categoryList,
      teachersList,
      headercourse
    })
  }).populate('category teacher')
});

/* Id orqali musiqani o'zgartirish sahifasi + rasm bilan. */
router.get('/kurslar/edit/image/:id', mw, async (req, res, next) => {
  const headercourse = await Category.aggregate([
    {
      $lookup : {
        from: 'courses',
        localField: '_id',
        foreignField: 'category',
        as: 'course'
      }
    }
  ])
  const categoryList = await Category.find()
  const teachersList = await Teacher.find()
  Course.findById(req.params.id, (err, course) => {
    console.log(course);
    res.render('courseImageEdit', {
      title: 'Kursni rasmini yangilash',
      course,
      categoryList,
      teachersList,
      headercourse
    })
  }).populate('category teacher')
});

/* Id orqali musiqani o'zgartirish metodi funksiyasi. */
router.post('/kurslar/edit/:id', mw, (req, res, next) => {
  // const file = req.file
  // const image_fileName = req.file.filename
  // const basePath = `${req.protocol}://${req.get('host')}/public/uploads/audios/`;
  const course = {}
  
  course.name = req.body.name
  course.teacher = req.body.teacher
  course.courseDate = req.body.courseDate
  // course.audio = req.files.audio[0].filename
  // course.image = req.files.image[0].filename
  course.category = req.body.category
  course.text = req.body.text


  const query = {_id: req.params.id}

  Course.update(query, course, (err) => {
      if(err) console.log(err);
      req.flash('alert alert-success', "Kurs yangilandi")
      res.redirect("/kurslar")
  })
});

/* Id orqali musiqani o'zgartirish metodi funksiyasi // rasm //. */
router.post('/kurslar/edit/image/:id', cpUpload, mw, (req, res, next) => {
  // const file = req.file
  // const image_fileName = req.file.filename
  // const basePath = `${req.protocol}://${req.get('host')}/public/uploads/audios/`;
  const course = {}
  

  course.image = req.files.image[0].filename



  const query = {_id: req.params.id}

  Course.update(query, course, (err) => {
      if(err) console.log(err);
      req.flash('alert alert-success', "Kurs yangilandi")
      res.redirect("/kurslar")
  })
});


/* Admin aloqa. */
router.get('/aloqa/admin/kurs/', mw, async(req, res, next) => {
  const headercourse = await Category.aggregate([
    {
      $lookup : {
        from: 'courses',
        localField: '_id',
        foreignField: 'category',
        as: 'course'
      }
    }
  ])
  const contacts = await ContactCourse.find().populate('course')
  console.log(contacts);
  res.render('aloqaKurs', {title: 'Kursga ruyxahtdan utish arizalari', contacts, headercourse});
});




/* Kursga a'zo bo'lish. */
router.post("/contact/add/pupils", async (req, res) => {
  req.checkBody("name", "Ismingizni kiriting").notEmpty();
  req.checkBody("phoneNumber", "Telefon raqamingizni kiriting ").notEmpty();

  const errors = req.validationErrors();
  // const query = {_id: req.params.id}
  if (errors) {
    res.render("/kurslar/:id", {
      title: "So'rov yuborishda hatolik mavjud",
      errors: errors,
    });
  } else {
    const contactcourse = new ContactCourse({
      name: req.body.name,
      phoneNumber: req.body.phoneNumber,
      course: req.body.course,
    });

    contactcourse = await contactcourse.save((err) => {
      if (err) console.log(err);
      else {
        req.flash("alert alert-success", "Arizangiz qabul qilindi, Siz bilan tez orada bog'lanamiz!");
        res.redirect("/");
      }
    });
  }
});

// ID bilan musiqani o'chirish
router.get('/contact/aloqa/kurs/:id', mw, (req, res, next) => {
  ContactCourse.findByIdAndDelete(req.params.id, (err) => {
      if(err) console.log(err);
      else{
          req.flash('alert alert-success', "Ariza o'chirildi")
          res.redirect('/aloqa/admin/kurs/')
      }
  })
});


/* Kurslar aloqa. */
router.get('/aloqa/admin/', mw, async(req, res, next) => {
  const headercourse = await Category.aggregate([
    {
      $lookup : {
        from: 'courses',
        localField: '_id',
        foreignField: 'category',
        as: 'course'
      }
    }
  ])
  const contacts = await Contact.find()
  console.log(contacts);
  res.render('aloqaAdmin', {title: 'Fikrlar, Taklif, Surovlar', contacts, headercourse});
});


/* Contact. */
router.post("/contact/add", async (req, res) => {
  req.checkBody("name", "Ismingizni kiriting").notEmpty();
  req.checkBody("phoneNumber", "Telefon raqamingizni kiriting ").notEmpty();
  req.checkBody("text", "Fikr yoki takliflaringizni Matn qatoriga kiriting").notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    res.render("/kurslar/:id", {
      title: "So'rov yuborishda hatolik mavjud",
      errors: errors,
    });
  } else {
    const contact = new Contact({
      name: req.body.name,
      phoneNumber: req.body.phoneNumber,
      text: req.body.text,
    });

    contact = await contact.save((err) => {
      if (err) console.log(err);
      else {
        req.flash("alert alert-success", "Fikr va takliflaringiz bilan o'rtoqlashganingiz uchun minnatdormiz!");
        res.redirect("/");
      }
    });
  }
});

// ID bilan musiqani o'chirish
router.get('/contact/aloqa/delete/:id', (req, res, next) => {
  Contact.findByIdAndDelete(req.params.id, (err) => {
      if(err) console.log(err);
      else{
          req.flash('alert alert-success', "Xabar o'chirildi")
          res.redirect('/aloqa/admin')
      }
  })
});

/* Id orqali musiqani o'zgartirish metodi funksiyasi. */
router.post('/contact/course/', (req, res, next) => {
  const contact = {}

  contact.name = req.body.name
  contact.phoneNumber = req.body.phoneNumber
  contact.course = req.body.course

  const query = {_id: req.params.id}

  Course.update(query, course, (err) => {
      if(err) console.log(err);
      req.flash('alert alert-success', "Kurs yangilandi")
      res.redirect("/kurslar")
  })
});


// ID bilan musiqani o'chirish
router.get('/kurslar/delete/:id', (req, res, next) => {
  Course.findByIdAndDelete(req.params.id, (err) => {
      if(err) console.log(err);
      else{
          req.flash('alert alert-success', "Kurs o'chirildi")
          res.redirect('/kurslar')
      }
  })
});

// router.get(`/kurslar/get/count`, async (req, res) => {
//   const courseCount = await Course.countDocuments((count) => count)

//   if(!courseCount) {
//     res.status(500).json({success: false})
//   }
//   res.send({
//     musicCount: courseCount
//   })
// })

// router.get(`/`, async (req, res) => {
//   const courseCount = await Course.find({})

//   if(!courseCount) {
//     res.status(500).json({success: false})
//   }
//   res.send({
//     courseCount: courseCount
//   })
// })

router.get('/aloqa', async(req, res, next) => {
  const headercourse = await Category.aggregate([
    {
      $lookup : {
        from: 'courses',
        localField: '_id',
        foreignField: 'category',
        as: 'course'
      }
    }
  ])
  res.render('contact', {
    title: 'ДЛЯ КОНТАКТА',
    headercourse
  })
});

router.get("/search/:name", (req, res) => {
  const regex = new RegExp(req.params.name, 'i');
  Course.find({name: regex}).then((result)=>{
    res.render('qidiruv', {
      title: 'Qidiruv natijalari',
      result
    })
    res.redirect('/search/:name')
    res.status(200).json(result)
  })
})



module.exports = router;
