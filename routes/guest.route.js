const express = require('express')
const router = express.Router() 
const guestController = require('../controllers/guest.controller') 
const { verifyGuestAuth } = require('../middleware/auth')

router.get('/', guestController.getWelcomePage)

router.get('/menu', guestController.getGuestMenu) 

router.get('/menu/:categoryName', guestController.getGuestItems)



module.exports = router;