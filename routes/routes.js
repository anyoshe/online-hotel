const express = require("express")
const router = express.Router();
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { connect, connection, model, Types } = mongoose;
const { body, validationResult } = require('express-validator');
const shortid = require('shortid');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const upload = require('../config/multer');
const path = require('path');
const axios = require('axios');
require('dotenv').config();


const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, unique: true }
});

UserSchema.pre('save', function(next) {
    if (this.isModified('password') || typeof this.password === 'undefined') {
        bcrypt.hash(this.password, 10, (err, hash) => {
            if (err) return next(err);
            console.log('Hashed password:', hash);
            this.password = hash;
            next();
        });
    } else {
        next();
    }
});

const User = model('User', UserSchema);  

// Passport Config
passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    User.findOne({ email }, async (err, user) => {
        if (err) {
            console.log('Error finding user:', err);
            return done(err);
        }
        if (!user) {
            console.log('Incorrect email.');
            return done(null, false, { message: 'Incorrect email.' });
        }
        console.log('Received password:', password);
        console.log('Stored hashed password:', user.password); 

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.log('Error during password comparison:', err);
                return done(err);
            }
            console.log('Password match result:', isMatch); // Log the result of the comparison

            if (!isMatch) {
                console.log('Incorrect password.');
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    });
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});


// Dish Models

const dishSchema = new Schema({
    orderCount: { type: Number, default: 0 },
    dishCode: { type: String, required: true, unique: true },
    dishName: { type: String, required: true },
    imageUrl: { type: String, required: false },
    quantity: { type: Number, required: true, default: 1 },
    dishPrice: { type: Number, required: true },
    dishCategory: { type: String, required: true },
    restaurant: { type: String, required: true },
    subTotal: { type: Number, required: false, default: 0 },
    dishDescription: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Dish = model("Dish", dishSchema);  
const userSearchHistorySchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dishCode: { type: String, required: true },
    searchedAt: { type: Date, default: Date.now },
  });
  
  const UserSearchHistory = mongoose.model('UserSearchHistory', userSearchHistorySchema);
  
//restaurant schema
const Restaurant = mongoose.model('Restaurant', new mongoose.Schema({
    restaurant: { type: String, required: true },
    dishName: { type: String, required: true },
    dishCategory: { type: String, required: true },
    dishDescription: { type: String, required: true },
    dishPrice: { type: Number, required: true },
}));
//category schema
const Category = mongoose.model('Category', new mongoose.Schema({
    dishCategory: { type: String, required: true },
    dishName: { type: String, required: true },
    restaurant: { type: String, required: true },
    dishDescription: { type: String, required: false },
    dishPrice: { type: Number, required: true },
}));

//orderDish schema
const orderDishSchema = new Schema({
    dish: { type: String, required: true },
    dishName: { type: String, required: true },
    quantity: { type: Number, required: true },
    dishPrice: { type: Number, required: true }
});
 
const orderSchema = new Schema({
    orderId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    selectedCategory: { type: String },
    selectedRestaurant: { type: String },
    customerLocation: { type: String, required: true },
    expectedDeliveryTime: { type: String, required: true },
    dishes: [
        {
            dishCode: { type: String, required: true },
            dishName: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }
        }
    ],
    totalPrice: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    delivered: { type: Boolean, default: false },
    paid: { type: Boolean, default: false }
});

const Order = model('Order', orderSchema);


// Routes
router.post('/auth/signup', async (req, res) => { 
    try {
    const { email, password, confirmPassword } = req.body;
       console.log(email, password, confirmPassword);
    if (password !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }
//check if user exist
    const existingUser = await User.findOne({ email });
    console.log(existingUser);
    if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }

  // Create new user
  const newUser = new User({ email, password });

  // Hash password securely using a Promise-based approach
  const saltPromise = bcrypt.genSalt(10);
  const hashPromise = saltPromise.then(salt => bcrypt.hash(newUser.password, salt));

  // Handle errors and create user
  await Promise.all([saltPromise, hashPromise])
    .then(([salt, hash]) => {
      newUser.password = hash;
      return newUser.save();
    })
    .then(savedUser => {
      res.status(201).json({ success: true, message: 'User registered successfully' });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Error saving user' });
    });
} catch (err) {
  console.error(err);
  return res.status(500).json({ success: false, message: 'Server error' });
}
});


router.post('/auth/login', async (req, res, next) => {
    passport.authenticate('local', async (err, user, info) => {
        if (err ||!user) {
            return res.status(400).json({ success: false, message: info? info.message : 'Authentication failed' });
        }
        req.login(user, { session: false }, (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Session error' });
            }
            return res.status(200).json({ success: true, message: 'Logged in successfully' });
        });
    })(req, res, next);
});


//add dish to database
router.post('/dishes', (req, res) => {
    console.log('Received request to add dish:', req.body); 
    upload(req, res, async (err) => {
        if (err) {
            console.error('Error uploading image:', err);
            return res.status(500).json({ message: 'Error uploading image', error: err });
        }

        try {
            const { dishCode, dishName, quantity, dishPrice, dishCategory, restaurant, dishDescription } = req.body;
            const imageUrl = req.file ? `/uploads/images/${req.file.filename}` : '';

            const newDish = new Dish({
                dishCode,
                dishName,
                quantity,
                dishPrice,
                dishCategory,
                restaurant,
                dishDescription,
                imageUrl,
            });

            await newDish.save();
            res.status(201).json(newDish);
        } catch (error) {
            console.error('Error creating dish:', error);
            res.status(500).json({ message: 'Error creating dish', error });
        }
    });
});

// Route to update dish details

router.put('/dishes/:dishCode', async (req, res) => {
    console.log(req.body); // Log the request body to see what's received
    try {
        // Extract text fields from the request body
        const { dishName, dishPrice, quantity, dishCategory, restaurant, dishDescription } = req.body;

        // Extract the file(s)
        const files = req.files; // Array of `file` objects, if any were uploaded

        // Construct the updatedFields object
        const updatedFields = {};
        if (dishName) updatedFields.dishName = dishName;
        if (dishPrice) updatedFields.dishPrice = dishPrice;
        if (quantity) updatedFields.quantity = quantity;
        if (dishCategory) updatedFields.dishCategory = dishCategory;
        if (restaurant) updatedFields.restaurant = restaurant;
        if (dishDescription) updatedFields.dishDescription = dishDescription;

        // Handle the file(s) if any were uploaded
        if (files && files.length > 0) {
            // Example: Set the first uploaded file's URL
            // Note: You might need to adjust this logic based on your requirements
            updatedFields.imageUrl = `/uploads/images/${files[0].filename}`;
        }

        // Update the dish in the database
        const updatedDish = await Dish.findOneAndUpdate({ dishCode: req.params.dishCode }, updatedFields, { new: true });

        if (!updatedDish) {
            return res.status(404).json({ error: 'Dish not found' });
        }

        res.json({ message: 'Dish updated successfully', dish: updatedDish });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update dish', message: error.message });
    }
});



// Route to delete a dish by dish code or dish name
router.delete('/dishes/:identifier', async (req, res) => {
    try {
        const { identifier } = req.params;

        // Check if the identifier exists
        if (!identifier) {
            return res.status(400).json({ error: 'Identifier not provided' });
        }

        // Find and delete the dish
        const deletedDish = await Dish.findOneAndDelete({
            $or: [{ dishCode: identifier }, { dishName: identifier }]
        });

        // Check if the dish was found and deleted
        if (!deletedDish) {
            return res.status(404).json({ error: 'Dish not found' });
        }

        res.json({ message: 'Dish deleted successfully', deletedDish });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete dish', message: error.message });
    }
});

// Route to search for a dish by dishCode or dishName
router.get('/dishes/search', async (req, res) => {
    try {
        const { query } = req.query;

        // Check if query is provided
        if (!query) {
            return res.status(400).json({ error: 'Query parameter not provided' });
        }

        // Search for dish by dishCode or dishName
        const dish = await Dish.findOne({
            $or: [{ dishCode: query }, { dishName: query }]
        });

        // Check if dish was found
        if (!dish) {
            return res.status(404).json({ error: 'Dish not found' });
        }

        res.json({ message: 'Dish found', dish });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to search dish', message: error.message });
    }
});


router.get('/search', async (req, res) => {
    const query = req.query.query;
    const type = req.query.type;

    if (!query || !type) {
        return res.status(400).json({ error: 'Missing query or type parameter' });
    }

    try {
        let results;
        switch (type) {
            case 'dishes':
                results = await Dish.find({
                    $or: [
                        { dishName: { $regex: query, $options: 'i' } },
                        { dishDescription: { $regex: query, $options: 'i' } }
                    ]
                });
                break;
            case 'restaurants':
                results = await Dish.find({ restaurant: { $regex: query, $options: 'i' } }).distinct('restaurant');
                break;
            case 'categories':
                results = await Dish.find({ dishCategory: { $regex: query, $options: 'i' } }).distinct('dishCategory');
                break;
            default:
                return res.status(400).json({ error: 'Invalid type parameter' });
        }

        res.json({ results });
    } catch (error) {
        console.error('Error during search:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

async function searchData(query, type) {
    const regex = new RegExp(query, 'i'); // Case-insensitive regex for partial matching
    switch (type) {
        case 'dishes':
            return await Dish.find({
                $or: [
                    { dishName: regex },
                    { dishDescription: regex },
                    { dishCategory: regex },
                    { restaurant: regex },
                ]
            });
        case 'restaurants':
            return await Dish.find({ dishCategory: regex }).distinct('restaurant');
        case 'categories':
            return await Dish.find({ dishCategory: regex }).distinct('dishCategory');
        default:
            return [];
    }
}

//getting all dishes
router.get('/dishes', async (req, res) => {
    try {
        const dishes = await Dish.find({});
        res.json({ message: 'Dishes retrieved successfully', dishes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve dishes', message: error.message });
    }
});

//getting a dish using dishCode
router.get('/dishes/:dishCode', async (req, res) => {
    try {
        const dish = await Dish.findOne({ dishCode: req.params.dishCode });
        if (!dish) {
            return res.status(404).send({ message: 'Dish not found' });
        }
        res.send(dish);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});

//fetching restaurants
router.get('/restaurants/:cuisineType', async (req, res) => {
    try {
        const cuisineType = req.params.cuisineType;
        const restaurants = await Dish.find({ dishCategory: cuisineType }).distinct('restaurant').exec();

        // Remove duplicates
        const uniqueRestaurants = [...new Set(restaurants)];

        res.json(uniqueRestaurants); // Send the restaurants as JSON
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        // Send a JSON response with an error message
        res.status(500).json({ error: 'Server error' });
    }
});

//fetching dishes for particular restaurant
router.get('/restaurantDishes', async (req, res) => {
    const restaurantName = req.query.restaurant; // Access restaurant name from query parameter

    try {
        const restaurantName = req.query.restaurant; // Access restaurant name from query parameter

        if (!restaurantName) {
            // Fetch all dishes if no restaurant specified (default behavior)
            const dishes = await Dish.find().exec();
            return res.json({ dishes });
        }
        const lowerCaseRestaurantName = restaurantName.toLowerCase(); // Convert to lowercase
        // Replace with your actual database query logic
        // Replace with your actual database query logic with case-insensitive comparison
        const dishes = await Dish.find({ restaurant: { $regex: lowerCaseRestaurantName, $options: 'i' } }).exec();
        res.json({ dishes });
    } catch (error) {
        console.error('Error fetching dishes:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
// working with orders from the customer

//Function to generate custom order IDs
async function generateOrderId() {
    const latestOrder = await Order.findOne({}, {}, { sort: { 'createdAt': -1 } });
    if (latestOrder) {
        const latestOrderId = latestOrder?.orderId?.substring(1); // Extract numeric part
        const nextOrderId = parseInt(latestOrderId) + 1;
        return 'O' + String(nextOrderId).padStart(4, '0'); // Format as O0001, O0002, etc.
    } else {
        return 'O0001'; // Initial ID if no existing orders
    }
}

// Function to create a new order
async function createOrder(orderData) {
    try {
        const orderId = await generateOrderId(); // Generate custom order ID
        orderData.orderId = orderId; // Assign custom ID to the order data
        const { selectedCategory, selectedRestaurant, ...otherOrderData } = orderData;
        const newOrder = new Order({
            ...otherOrderData,
            selectedCategory,
            selectedRestaurant
        });
        if (!selectedCategory || !selectedRestaurant) {
            throw new Error('Missing required order details: selectedCategory and selectedRestaurant');
        }
        const savedOrder = await newOrder.save();
        return savedOrder;
    } catch (error) {
        throw error;
    }
}

module.exports = { Order, createOrder };
// Your route handler for creating a new order
router.post('/orders', async (req, res) => {
    try {
        // Extract order data from the request body
        const orderData = req.body;

        // Generate custom order ID and assign it to the order data
        const orderId = await generateOrderId();
        orderData.orderId = orderId;

        // Create a new order and save it to the database
        const newOrder = await createOrder(orderData);

        // Send a success response with the newly created order
        res.status(201).json({ message: 'Order created successfully', order: newOrder });
    } catch (error) {
        // Handle any errors and send an error response
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Endpoint to save order
router.post('/save-order', async (req, res) => {
    const orderDetails = req.body;
    try {
      await saveOrder(orderDetails);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save order' });
    }
  });

// Route to retrieve all orders
router.get('/orders', async (req, res) => {
    try {
        // Retrieve all orders from the database
        const orders = await Order.find();

        // If there are no orders, send an appropriate response
        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No orders found' });
        }

        // Map the retrieved orders to the desired format
        const formattedOrders = orders.map(order => {
            return {
                orderId: order.orderId,
                customerName: order.customerName,
                phoneNumber: order.phoneNumber,
                selectedCategory: order.selectedCategory,
                selectedRestaurant: order.selectedRestaurant,
                customerLocation: order.customerLocation,
                expectedDeliveryTime: order.expectedDeliveryTime,
                orderedDishes: order.dishes.map(dish => {
                    return {
                        dishName: dish.dishName,
                        quantity: dish.quantity
                    };
                }),
                totalPrice: order.totalPrice,
                createdAt: order.createdAt,
                delivered: order.delivered
            };
        });

        // Send the formatted orders as a response
        res.status(200).json(formattedOrders);
    } catch (error) {
        console.error('Error retrieving orders:', error);
        res.status(500).json({ error: 'Failed to retrieve orders' });
    }
});


// PUT route to mark an order as delivered

router.put('/orders/:orderId/deliver', async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await Order.findOne({ orderId });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.delivered = true;

        await order.save();

        res.json({ message: 'Order marked as delivered', order });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

//mark as paid
router.post('/updatePaidStatus', async (req, res) => {
    console.log('Received updatePaidStatus request');
    const { restaurant, orderIds } = req.body;
    console.log(restaurant, orderIds);
    //console.log(Order.find().explain('executionStats'));
    try {
        // Execute the updateMany operation
        const result = await Order.updateMany(
            { selectedRestaurant: restaurant, orderId: { $in: orderIds } },
            { $set: { paid: true } }
        );

        // Log the response from the update operation
        console.log(result);

    } catch (error) {
        console.error('Error updating orders:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});


// Route to fetch delivered orders and calculate total sales and commission
router.get('/orders/delivered', async (req, res) => {
    try {
        // Find all delivered orders
        const deliveredOrders = await Order.find({ delivered: true });

        // Calculate total sales and commission
        let totalSales = 0;
        deliveredOrders.forEach(order => {
            totalSales += order.totalPrice;
        });

        const commission = totalSales * 0.1; // Assuming commission is 10% of total sales

        // Send the delivered orders, total sales, and commission in the response
        res.json({ orders: deliveredOrders, totalSales, commission });
    } catch (error) {
        console.error('Error fetching delivered orders:', error);
        res.status(500).json({ error: 'Failed to fetch delivered orders' });
    }
});

router.get('/searchAny', async (req, res) => {
    console.log('Received search request');
    const searchTerm = req.query.q;
    const type = req.query.type;
    console.log('Received request:', req.query);
    if (!searchTerm || !type) {
        console.log('Bad request: Missing required query parameters');
        return res.status(400).json({ error: 'Bad Request', message: 'Missing required query parameters: q and type' });
    }

    let filter = {};
    if (type === 'suggestion') {
        if (!searchTerm) {
            return res.json([]); // Return empty array for empty search
        }
        filter.$or = [
            { dishName: { $regex: searchTerm, $options: 'i' } },
            { dishDescription: { $regex: searchTerm, $options: 'i' } },
            { dishCategory: { $regex: searchTerm, $options: 'i' } }
        ];
    } else if (type === 'exact') {
        filter = { name: searchTerm };
    }

    try {
        const results = await Dish.find(filter).exec(); // Use the model to find documents
        console.log('Search results:', results);
        res.json(results);
    } catch (err) {
        console.error('Error occurred during the search:', err);
        res.status(500).json({ error: 'An error occurred during the search.', details: err.message });
    }
});
router.get('/dishes/details/:dishCode', async (req, res) => {
    const { dishCode } = req.params;
  
    try {
      // Fetch the dish details from the database
      const dishDetail = await Dish.findOne({ dishCode: dishCode }, '-_id'); // Exclude '_id' field if not needed
  
      // Check if the dish detail was found
      if (!dishDetail) {
        return res.status(404).json({ message: 'Dish not found' });
      }
  
      // At this point, you would typically combine the fetched details with other data structures
      // Since we're focusing on fetching the missing details, let's assume you have a way to combine them
      // For demonstration, we're returning the fetched detail directly
      res.json(dishDetail);
    } catch (error) {
      console.error('Error fetching dish details:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  
// Route for category suggestions
router.get('/categories/suggestions', async (req, res) => {
    const { categoryName } = req.query;
    try {
      const categories = await Category.find({ name: { $regex: categoryName, $options: 'i' } });
      res.json(categories);
    } catch (error) {
      console.error('Error fetching category suggestions:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  // Route for restaurant suggestions
  router.get('/restaurants/suggestions', async (req, res) => {
    const { restaurantName } = req.query;
    try {
      const restaurants = await Restaurant.find({ name: { $regex: restaurantName, $options: 'i' } });
      res.json(restaurants);
    } catch (error) {
      console.error('Error fetching restaurant suggestions:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  //fetching dishes by category
  router.get('/v1/dishes', async (req, res) => {
    try {
      const { category } = req.query; // Get category from query parameter
  
      let dishes;
      if (category) {
        dishes = await Dish.find({ dishCategory: category }); // Filter by category if provided
      } else {
        dishes = await Dish.find({}); // Retrieve all dishes if no category specified
      }
  
      res.json({ message: 'Dishes retrieved successfully', dishes });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to retrieve dishes', message: error.message });
    }
  });

//   router.get('/userSearchHistory', async (req, res) => {
//     try {
//       // Extract userId from the request query
//       const userId = req.query.userId;
  
//       // Check if userId is missing or invalid
//       if (!userId) {
//         return res.status(400).json({ error: 'Missing userId parameter' });
//       }
  
//       // Attempt to retrieve user search history
//       const searchHistory = await UserSearchHistory.find({ userId });
  
//       // Return search history as response
//       res.json(searchHistory || []);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   }); 

// PAYMENTS CONTROLS ROUTES
const consumerKey = process.env.CONSUMER_KEY;
const consumerSecret = process.env.CONSUMER_SECRET;
const shortcode = process.env.SHORTCODE;
const passkey = process.env.PASSKEY;
const ngrokUrl = process.env.NGROK_URL;

router.post('/mpesa/callback', (req, res) => {
    const callbackData = req.body;
    console.log('M-Pesa Callback Received:', callbackData);
    
    // Your logic to handle the callback data goes here...
  // Extract relevant information from the callback data
  const { Body, ResultCode, ResultDesc } = callbackData;

  // Log the callback data for debugging or auditing
  console.log('Callback Body:', Body);
  console.log('Result Code:', ResultCode);
  console.log('Result Description:', ResultDesc);

  // Example: Process the callback based on ResultCode
  if (ResultCode === 0) {
    // Successful transaction
    // Update your database, notify user, etc.
    console.log('Payment successful. Update database...');
  } else {
    // Failed transaction
    // Handle failure scenario
    console.log('Payment failed:', ResultDesc);
  }
    // Respond with a success status to acknowledge receipt
    res.sendStatus(200);
  });
  
// Route to get M-Pesa access token
router.get('/token', async (req, res) => {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  try {
    const response = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });

    console.log('Access Token Response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching access token:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to fetch access token', details: error.message });
  }
});

// Route to handle M-Pesa payment
const generateTimestamp = () => { 
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  };
  
router.post('/mpesa/pay', async (req, res) => {
  const { phoneNumber, amount } = req.body;

  try {
    const timestamp = generateTimestamp();
    
    // Fetch access token
    const authResponse = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')}`
      }
    });

    if (!authResponse.data.access_token) {
      throw new Error('Failed to fetch access token');
    }

    const { access_token } = authResponse.data;

    // Initiate payment
    //const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
    

    console.log('Access Token:', access_token);
    console.log('Timestamp:', timestamp);
    console.log('Password:', password);

    const paymentData = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: shortcode,
      PhoneNumber: phoneNumber,
      CallBackURL: `${ngrokUrl}/mpesa/callback`,
      AccountReference: 'Test123',
      TransactionDesc: 'Test Payment'
    };

    console.log('Payment Data:', paymentData);

    const paymentResponse = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', paymentData, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Payment Response:', paymentResponse.data);
    res.json(paymentResponse.data);
  } catch (error) {
    console.error('Error initiating M-Pesa payment:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to initiate payment', details: error.message });
  }
});
// Example route to handle sending receipts
router.post('/send-receipt', async (req, res) => {
    try {
      // Implement logic to send receipt here
      const { phoneNumber, amount } = req.body;
  
      // Example logic to send receipt via SMS or any other method
      const receiptSent = await sendReceiptMessage(phoneNumber, amount);
  
      // Respond with success message
      res.status(200).json({ message: 'Receipt sent successfully' });
    } catch (error) {
      console.error('Error sending receipt:', error);
      res.status(500).json({ error: 'Failed to send receipt' });
    }
  });
  
// Function to send receipt
async function sendReceipt(phoneNumber, amount) {
    const message = `Thank you for your payment of KES ${amount}. Your order is being processed.`;
    // Logic to send SMS (you can use a service like Twilio or any other SMS gateway)
    await axios.post('https://sms-gateway-api/send', {
      to: phoneNumber,
      message: message
    });
  }
  // Route to handle saving orders
router.post('/paidOrder', async (req, res) => {
    try {
      const orderDetails = req.body;
  

    // Ensure unique order ID
    orderDetails.orderId = uuidv4();

      // Save order to database
      await saveOrder(orderDetails);
  
      res.status(200).json({ message: 'Order saved successfully' });
    } catch (error) {
      console.error('Error saving order:', error);
      res.status(500).json({ error: 'Failed to save order' });
    }
  });
  
  // Function to save order details in the database
  async function saveOrder(orderDetails) { 
    const order = new Order({
      orderId: orderDetails.orderId,
      customerName: orderDetails.customerName,
      phoneNumber: orderDetails.phoneNumber,
      selectedCategory: orderDetails.selectedCategory,
      selectedRestaurant: orderDetails.selectedRestaurant,
      customerLocation: orderDetails.customerLocation,
      expectedDeliveryTime: orderDetails.expectedDeliveryTime, 
      dishes: orderDetails.dishes,
      totalPrice: orderDetails.totalPrice, 
      delivered: false,
      paid: true // Assuming the payment was successful
    });
  
    await order.save();
  }


module.exports = router;  