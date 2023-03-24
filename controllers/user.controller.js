const Category = require('../models/Category')
const Item = require('../models/Item')
const usersData = require('../models/UserData')
const Cart = require('../models/CartUser')
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const sessions = require('express-session');
const session = require('express-session');
const UserData = require('../models/UserData');
exports.getUserPage = (req, res) => {
    res.send("User Page")
}
exports.getUserLoginPage = (req, res) => {
    res.render('user/login', {
        error: req.flash('error'),
        success: req.flash('success')
    })
}
exports.postUserLoginPage = async (req, res) => {
    const { logname, logpass } = req.body;
    try {
        //  database field : loginform name
        const users = await usersData.findOne({ UserName: logname });
        if (!users) {
            req.flash('error', "User Not found!!")
            return res.redirect('/user/login')
        }
        // form,passworddatabase
        const isMatch = await bcrypt.compare(logpass, users.Password);
        if (!isMatch) {
            req.flash('error', "Password Incorrect")
            return res.redirect('/user/login')
        } else {
            console.log("user and password succesfully found")
        }
        // Create a session for the user
        req.session.useId = {
            id: users.id,
            name: users.UserName
        }
        req.session.userAuth = true
        console.log(req.session.useId)
        res.redirect('/user/menu');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
}

exports.getUserSignupPage = (req, res) => {
    res.render('user/signup', {
        error: req.flash('error')
    })

}

exports.postUserSignupPage = async (req, res) => {
    try {
        const userExist = await usersData.findOne({ Email: req.body.signmail }).lean()
        if (userExist) {
            req.flash("error", "user alredy exist")
            return res.redirect('/user/signup')
        }

        bcrypt.hash(req.body.signpass, saltRounds, (err, hash) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Error hashing password');
            }
            const newUser = new usersData({
                UserName: req.body.signname,
                Password: hash,
                Email: req.body.signmail,
                Number: req.body.signnumber
            });

            newUser.save().then(() => {
                req.flash("success", "User added Successfully")
                res.redirect('/user/login');
            })

        })
    } catch (error) {
        console.log(error);
        res.status(500).send('error adding user ')

    }


}



exports.getUserMenuPage = async (req, res) => {
    try {
        const userName = req.session.useId.name;
        console.log(userName + "usernamw");
        // Retrieve all the categories
        const categories = await Category.find({}).lean();

        // Render the menu page with the categories
        res.render('user/menu', { categories, userName });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}

exports.getUserMenuItemPage = async (req, res) => {
    try {
        const { categoryName } = req.params;
        console.log(categoryName + " categoryname");

        // Retrieve the category with the given name
        const category = await Category.findOne({ name: categoryName }).lean();
        console.log(category);

        // Retrieve all the items that belong to that category
        const items = await Item.find({ category: category._id }).lean(); 
        console.log(items)
        
        // Loop through the items and add the quantity property to each item object
        for (let i = 0; i < items.length; i++) {
            const cartItem = await Cart.findOne({ user: req.session.useId.id, item: items[i]._id });
            console.log(cartItem + "deeebuuug");
            if (cartItem) {
                items[i].quantity = cartItem.quantity;
                console.log(cartItem.quantity + "why this is undefined");
                
            } else {
                items[i].quantity = 0;
            }
        }


        // Render the category page with the items
        res.render('user/menu-items', { category, items }); 
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}
exports.addToCart = async (req, res) => {
    try{
        const userId = req.session.useId.id;
        console.log(userId + " user id found"); 
        let userCart = await Cart.findOne({user : userId });
        if(!userCart){
            userCart = await new Cart({
                user : userId 
            }).save()
            console.log("new cart created for user!!!:)", userId);
        }
        const { itemId, quantity } = req.body;
        console.log(itemId + " item found and no :" + quantity );
        const existingItem = userCart.items.find(item => item.product.toString() === itemId);
        if (existingItem) {
            existingItem.quantity += parseInt(quantity);
            existingItem.updatedAt = Date.now();
            console.log('Item quantity updated in cart:', existingItem);
        } else {
            userCart.items.push({ product: itemId, quantity: parseInt(quantity) });
            console.log('Item added to cart:', itemId);
        }
        // Save cart to database
        await userCart.save();
        res.redirect('/user/menu');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
    }
exports.getUserCartPage = async(req,res)=>{
    const fetchuser = await UserData.findById(req.session.useId.id);
    console.log(fetchuser + " user found");
    // Define a new route to display the user's cart items
    try {
      // Find  user's cart and populate the items array with the corresponding product documents
      const cart = await Cart.findOne({ user: req.session.useId.id }).populate('items.product').lean();
        console.log(cart);
        if (!cart) {
            return res.render('user/cart', { cart: null, grandTotal: 0 });
          }

      // Calculate the total price for each cart item
    cart.items.forEach(item => {
        item.totalPrice = item.product.price * item.quantity;
      });
      
  
      // Calculate the grand total of all cart items
      const grandTotal = cart.items.reduce((total, item) => total + item.totalPrice, 0);
      console.log(grandTotal);
      res.render('user/cart', { cart, grandTotal });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server Error' });
    }
  };

exports.userLogout = (req, res) => {
    req.session.useId = null
    req.session.userAuth = false
    console.log("session Turned false")
    res.redirect('/')
}

// try {
    //     console.log(req.session.useId.id + " id founded  for user to add");
    //     const user = await UserData.findById(req.session.useId.id);
    //     console.log(user + " user found");
    //     const { itemId } = req.body;
    //     console.log(itemId + "item found");
         
    //     // Add item to user's cart
    //     const newuserCart = new Cart({
    //         user : req.session.useId.id
    //     })
    //     newuserCart.save()
    //   .then(() => {
    //     console.log('New item added to the cart')
    //   })
    //   .catch((err) => {
    //     console.error(err)
    //     res.status(500).send('Error adding item to cart')
    //   })
    //     res.redirect('/user/menu');
    // } catch (error) {
    //     console.error(error);
    //     res.status(500).json({ error: 'Server Error' });
    // }