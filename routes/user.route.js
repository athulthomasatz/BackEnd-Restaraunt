const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller') 
const { verifyAuth } = require('../middleware/auth')

router.get('/', userController.getUserPage) 
router.get('/login', userController.getUserLoginPage)
router.post('/login', userController.postUserLoginPage)
router.get('/signup', userController.getUserSignupPage)
router.post('/signup', userController.postUserSignupPage)

router.get('/menu', verifyAuth, userController.getUserMenuPage) 
router.get('/menu/:categoryName', verifyAuth, userController.getUserMenuItemPage) 

router.post('/cart', verifyAuth, userController.addToCart);
router.get('/cart-view',verifyAuth,userController.getUserCartPage)   

router.get('/order',verifyAuth,userController.getOrderPage)
router.post('/place-order', verifyAuth, userController.placeOrder);


router.get('/logout',verifyAuth,userController.userLogout)

module.exports = router;