const express = require("express");
const Category = require("../model/Category");
const mw = require("../middleware/mw");
const Course = require("../model/Course");
const Teacher = require("../model/Teacher");
const router = express.Router();

router.get(`/categories`, mw, async (req, res) => {
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
  const categoryList = await Category.find();
  if (!categoryList) {
    res.status(500).json({ success: false });
  }
  // res.send(categoryList)
  res.render("category", {
    title: "Bo'limlar",
    categoryList,
    headercourse
  });
});

/* bo'lim qo'shish sahifasi. */
router.get("/categories/add", mw, async(req, res, next) => {
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
  res.render("categoryAdd", { title: `Bo'lim yaratish`, headercourse });
});



/* bo'lim qo'shish sahifasi. */
router.post("/categories/add", async (req, res) => {
  req.checkBody("name", "Kategoriya nomi kiritilmadi").notEmpty();
  req.checkBody("icon", "icon kitilmadi").notEmpty();
  req.checkBody("color", "rang tanlanmadi").notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    res.render("categoryAdd", {
      title: "Yangi bo'lim yaratishda validator ishlayapti",
      errors: errors,
    });
  } else {
    let category = new Category({
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color,
    });
    // category = await category.save()

    category = await category.save((err) => {
      if (err) console.log(err);
      else {
        req.flash("alert alert-success", "Bo'lim yaratildi");
        res.redirect("/categories");
      }
    });
  }
});

router.get(`/categories/:id`, async (req, res) => {
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
  const category = await Category.findById(req.params.id);
  const teacher = await Teacher.find();
  const courses = await Course.find({ category: category }).populate('category teacher')
  if (!category) {
    res.status(500).json({ message: "The category with the given ID was" });
  }
  res.render("category-single", {
    title: "Bo'lim",
    category,
    courses,
    teacher,
    headercourse
  })
});

router.get(`/categories/:id/course`, async (req, res) => {
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
  const category = await Category.findById(req.params.id);
  const courses = await Course.find({ category: category });
  const teacher = await Teacher.find();
  if (!category) {
    res.status(500).json({ message: "The category with the given ID was" });
  }
  res.render("category-single", {
    title: "Bo'lim",
    category,
    courses,
    teacher,
    headercourse
  });
});

router.get("/categories/edit/:id", mw, async (req, res, next) => {
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
  Category.findById(req.params.id, (err, categories) => {
    console.log(categories);
    res.render("categoryEdit", {
      title: "Bo'limni tahrirlash",
      categories,
      headercourse
    });
  });
});



router.post('/categories/edit/:id', (req, res, next) => {
    const category = {}
    
    category.name = req.body.name
    category.icon = req.body.icon
    category.color = req.body.color
  
  
    const query = {_id: req.params.id}
  
    Category.update(query, category, (err) => {
        if(err) console.log(err);
        req.flash('alert alert-success', "Bo'lim yangilandi")
        res.redirect("/categories")
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
router.get("/categories/delete/:id", function (req, res, next) {
  Category.findByIdAndDelete(req.params.id, (err) => {
    if (err) console.log(err);
    else {
      req.flash("alert alert-success", "Bo'lim o'chirildi");
      res.redirect("/categories");
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
