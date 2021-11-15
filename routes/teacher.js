const express = require("express");
const Teacher = require("../model/Teacher");
const Category = require("../model/Category");
const mw = require("../middleware/mw");
const multer = require('multer');
const router = express.Router();

const image_storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/img/teacher/')
  },
  filename: function (req, file, cb) {
    const image_fileName = file.originalname.split(' ').join('-')
    cb(null, `${image_fileName}`)
  }
})
const image_uploadOptions = multer({ storage: image_storage })



router.get(`/`, async (req, res) => {
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
  const teachersList = await Teacher.find();
  if (!teachersList) {
    res.status(500).json({ success: false });
  }
  // res.send(categoryList)
  res.render("teachers", {
    title: "O'qituvchilarimiz",
    teachersList,
    headercourse
  });
});

/* O'qituvchi qo'shish sahifasi. */
router.get("/add", mw, async(req, res, next) => {
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
  res.render("teacherAdd", { title: `O'qituvchi yaratish`, headercourse });
});



const cpUpload = image_uploadOptions.fields([{ name: 'audio', maxCount: 1 }, { name: 'image', maxCount: 1 }])

router.post("/add", cpUpload, async(req, res) => {
  req.checkBody("name", "O'qituvchi ismi kiritilmadi").notEmpty();
  req.checkBody("text", "matn kitilmadi").notEmpty();
  req.checkBody("telegram", "Telegram sahifasi manzili kiritilmadi").notEmpty();
  req.checkBody("phoneNumber", "Telefon raqami kiritilmadi").notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    res.render("teacherAdd", {
      title: "Yangi o'qituvchi yaratishda hatolik mavjud, iltimos qaytadan urunib ko'ring",
      errors: errors,
    });
  } else {
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/images/teacher`;
    const teacher = new Teacher()

    teacher.name = req.body.name
    teacher.image = req.files.image[0].filename
    teacher.text = req.body.text
    teacher.telegram = req.body.telegram
    teacher.phoneNumber = req.body.phoneNumber
    teacher.instagram = req.body.instagram

    // category = await category.save()

    teacher = await teacher.save((err) => {
      if (err) console.log(err);
      else {
        req.flash("alert alert-success", "O'qituvchi yaratildi");
        res.redirect("/");
      }
    });
  }
});

router.get(`/:id`, async (req, res) => {
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
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) {
    res.status(500).json({ message: "Ko'rsatilgan ID bo'yicha o'qituvchi topilmadi" });
  }
  res.render("teachers", {
    title: "O'qituvchilar",
    teacher,
    headercourse
  });
});

// router.get(`/:id/music`, async (req, res) => {
//   const category = await Category.findById(req.params.id);
//   const musics = await Music.find({ category: category });
//   if (!category) {
//     res.status(500).json({ message: "The category with the given ID was" });
//   }
//   res.render("category-single", {
//     title: "Bo'lim",
//     category,
//     musics,
//   });
// });

router.get("/edit/:id", mw, async (req, res, next) => {
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
  Teacher.findById(req.params.id, (err, teacher) => {
    console.log(teacher);
    res.render("teacherEdit", {
      title: "O'qituvchi ma'lumotlarini tahrirlash",
      teacher,
      headercourse
    });
  });
});



router.post('/edit/:id', cpUpload, (req, res, next) => {
    const teacher = {}

    teacher.name = req.body.name
    teacher.image = req.files.image[0].filename
    teacher.text = req.body.text
    teacher.telegram = req.body.telegram
    teacher.phoneNumber = req.body.phoneNumber
    teacher.instagram = req.body.instagram
  
  
    const query = {_id: req.params.id}
  
    Teacher.update(query, teacher, (err) => {
        if(err) console.log(err);
        req.flash('alert alert-success', "O'qituvchi ma'lumotlari yangilandi")
        res.redirect("/teacher")
    })
  });

// router.put("/edit/:id", async (req, res) => {
//   const category = await Category.findByIdAndUpdate(
//     req.params.id,
//     {
//       name: req.body.name,
//       icon: req.body.icon,
//       color: req.body.color,
//     },
//     { new: true }
//   );
//   if (!category) return res.status(400).send("the category cannot be created");

//   res.send(category);
//   res.render("categories", {
//     title: "Kategoriya",
//     category,
//   });
// });

// ID bilan musiqani o'chirish
router.get("/delete/:id", function (req, res, next) {
  Teacher.findByIdAndDelete(req.params.id, (err) => {
    if (err) console.log(err);
    else {
      req.flash("alert alert-success", "O'qituvchi ma'lumotlari o'chirildi");
      res.redirect("/teacher");
    }
  });
});

// router.delete('/:id', (req, res) => {
//     Category.findByIdAndRemove(req.params.id).then(category =>{
//         if(category) {
//             return res.status(200).json({succsess: true, message: 'the category is deleted!'})
//         }else{
//             return res.status(404).json({succsess: false, message: 'category not found'})
//         }
//     }).catch(err=>{
//         return res.status(400).json({succsess: false, error: err})
//     })
// })

module.exports = router;
