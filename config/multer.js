const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
  destination: './uploads/images', // Directory to save images
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize upload variable
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1MB file size limit
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).single('image');

// Setup for multiple file uploads (for conference spaces)
const conferenceStorage = multer.diskStorage({
  destination: './uploads/conferences', // Directory to save conference files
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const uploadMultiple = multer({
  storage: conferenceStorage,
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).fields([
  { name: 'venueImages', maxCount: 5 }, 
  { name: 'videoTours', maxCount: 1 }, 
  { name: 'floorPlans', maxCount: 1 }
]);


// Check file type
function checkFileType(file, cb) {
  // Allowed file extensions
  const filetypes = /jpeg|jpg|png|gif/;
   // Allowed file extensions for videos
   const videoFiletypes = /mp4|webm|ogg/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check if the file is a video
  const isVideo = videoFiletypes.test(path.extname(file.originalname).toLowerCase());
  // Check MIME type
  const mimetype = filetypes.test(file.mimetype);
  const videoMimetype = videoFiletypes.test(file.mimetype);

  if ((mimetype && extname) || (isVideo && videoMimetype)) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Images and Videos Only!'));
    
  }
}


module.exports = { upload, uploadMultiple };
