const express = require('express')
const multer = require('multer')
const { storage } = require('../cloudinary/index')
const upload = multer({ storage })
const sanitize = require('../middleware/sanitizeHTML')
const isLoggedIn = require('../middleware/isLoggedIn')
const isCampOwner = require('../middleware/isCampOwner')
const validateCamp = require('../middleware/validateCamp')
const { index, newForm, showCamp, createNewCamp, editForm, editCamp, deleteCamp, findCampById } = require('../controllers/campgrounds')

const router = express.Router()

router.param('id', findCampById)

router.get('/', index)
router.post('/', isLoggedIn, upload.array('images'), sanitize, validateCamp, createNewCamp)

router.get('/new', isLoggedIn, newForm)

router.get('/:id', showCamp)
router.patch('/:id', isLoggedIn, isCampOwner, upload.array('images'), sanitize, validateCamp, editCamp)
router.delete('/:id', isLoggedIn, isCampOwner, deleteCamp)

router.get('/:id/edit', isLoggedIn, isCampOwner, editForm)

module.exports = router
