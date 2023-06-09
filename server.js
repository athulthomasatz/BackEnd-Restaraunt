const express = require('express')
const helpers = require('./helpers/helpers');
const path = require('path')
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const dotenv = require('dotenv')
const fileUpload = require('express-fileupload')
const ConnectDb = require('./config/connection')
const cookie = require('cookie-parser')
const session = require('express-session')
const flash = require('connect-flash')
const morgan = require('morgan')
dotenv.config()
const { engine } = require('express-handlebars')
const guestRouter = require('./routes/guest.route')
const userRouter = require('./routes/user.route')
const staffRouter = require('./routes/staff.route')
const managerRouter = require('./routes/manager.route')
const cashierRouter = require('./routes/cashier.route')
const adminRouter = require('./routes/admin.route')
const { connect } = require('http2')
const app = express()
 

// Database connect
ConnectDb()
//session and cookie
app.use(flash())
app.use(express.json())
app.use(flash())
app.use(fileUpload())
app.use(morgan(':method :url :status'))
app.use(cookie());
app.use(session({
    secret : process.env.SESSION_SECERT,
    resave : false,
    saveUninitialized : true
}))
//body-parser setting and parse incoming data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({extended:false}))
app.use(express.static(path.join(__dirname, 'public')))

// use method-override middleware
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));

//engine set up
const hbs = require('hbs');

hbs.registerHelper('calculateTotalPrice', helpers.calculateTotalPrice);

app.use(express.urlencoded({extended:true}))
app.engine('hbs', engine({
    extname:'hbs',
    partialsDir : path.join(__dirname,'views','partials')  
}))
app.set('view engine', 'hbs')
app.set('views', './views');

app.use(express.static('public'))
//main routes
app.use('/guest',guestRouter)
app.use('/user', userRouter)
app.use('/staff', staffRouter)
app.use('/manager', managerRouter)
app.use('/cashier', cashierRouter)
app.use('/admin', adminRouter)

app.get('/', (req,res) => {
    res.render('guest/welcome') 
})

const port = 7000
app.listen( port , () => console.log(`server running on port ${port}`));






