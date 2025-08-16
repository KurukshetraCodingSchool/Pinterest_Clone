const multer = require('multer')
const path = require('path')
const crypto = require('crypto')

// disk Storage 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      if (file.fieldname === 'postImage') {
        cb(null,'./public/uploads/images')
      } 
    //   else if (file.fieldname === 'post') {
    //     cb(null,'./public/uploads/pdfs')
    //   }
    },
    filename: function (req, file, cb) {
     crypto.randomBytes(12, function(err,name){
        const fn = name.toString("hex") +path.extname(file.originalname)
        cb(null, fn)
     }) 
 
    }
  })
  
  // Export Upload variable
  const upload = multer({ storage: storage })

  module.exports = upload