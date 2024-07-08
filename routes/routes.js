const express = require("express")
const router = express.Router();
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Schema = mongoose.Schema;
const { connect, connection, model, Types } = mongoose;
const { body, validationResult } = require('express-validator');
const shortid = require('shortid');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const { upload, uploadMultiple } = require('../config/multer');
const path = require('path');
const axios = require('axios');
require('dotenv').config();


const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  names: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true }
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model('User', userSchema); 

router.post('/auth/signup', async (req, res) => {
  const { username, names, email, phoneNumber, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    user = new User({ username, names, email, phoneNumber, password });
    await user.save();
    res.json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, 'secret', { expiresIn: '1h' });
    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
router.get('/auth/current', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, 'secret'); // Use your secret key here
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
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
  averageRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 }
});

const Dish = model("Dish", dishSchema);


//restaurant schema
const restaurantSchema = new mongoose.Schema({
  restaurant: { type: String, required: true },
  dishCategory: { type: String, required: true },
  averageRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 }
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

//category schema
const Category = mongoose.model('Category', new mongoose.Schema({
  dishCategory: { type: String, required: true },
  restaurant: { type: String, required: true },
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
  deliveryCharges: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  delivered: { type: Boolean, default: false },
  paid: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Order received', 'Processed and packed', 'Dispatched', 'Delivered'], default: 'Order received' },
});

const Order = model('Order', orderSchema);

const specialOrderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  deliveryLocation: { type: String, required: true },
  deliveryDate: { type: Date, required: true },
  deliveryTime: { type: String, required: true },
  orderDetails: { type: String, required: true },
  specialInstructions: { type: String },
  status: { type: String, enum: ['Order received', 'Processed and packed', 'Dispatched', 'Delivered'], default: 'Order received' },
  createdAt: { type: Date, default: Date.now }
});
const SpecialOrder = mongoose.model('SpecialOrder', specialOrderSchema);
//event orders
const eventOrderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  eventDate: { type: Date, required: true },
  eventLocation: { type: String, required: true },
  message: { type: String }
});

const EventOrder = mongoose.model('EventOrder', eventOrderSchema);

const ConferenceSchema = new mongoose.Schema({
  venueName: { type: String, required: true },
  address: { type: String, required: true },
  gpsCoordinates: { type: String },
  seatingCapacity: { type: Number, required: true },
  layoutOptions: { type: [String] },
  roomDimensions: { type: String },
  avEquipment: { type: [String] },
  cateringServices: { type: [String] },
  wiFiAccess: { type: String },
  airConditioning: { type: String },
  parkingFacilities: { type: String },
  accessibility: { type: String },
  pricingStructure: { type: String, required: true },
  bookingAvailability: { type: String, required: true },
  paymentOptions: { type: String, required: true },
  venueImages: { type: [String] },
  videoTours: { type: [String] },
  floorPlans: { type: [String] },
  eventPlanningAssistance: { type: [String] },
  decorationServices: { type: [String] },
  transportServices: { type: [String] },
  securityServices: { type: [String] },
  contactPerson: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  emailAddress: { type: String, required: true },
}, { timestamps: true });

const Conference = mongoose.model('Conference', ConferenceSchema);
// module.exports = mongoose.model('Conference', ConferenceSchema);
//rating schema
const ratingSchema = new Schema({ 
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  item_id: { type: Schema.Types.ObjectId, required: true },
  item_type: { type: String, enum: ['Dish', 'Restaurant'], required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: false },
  status: { type: String, enum: ['Order received', 'Processed and packed', 'Dispatched', 'Delivered'], default: 'Order received' },
  createdAt: { type: Date, default: Date.now }
});

const Rating = mongoose.model('Rating', ratingSchema);
module.exports = Rating;
const userSearchHistorySchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dishCode: { type: String, required: true },
  searchedAt: { type: Date, default: Date.now },
});

const UserSearchHistory = mongoose.model('UserSearchHistory', userSearchHistorySchema);
// Routes
//add dish to database and restaurant
router.post('/dishes', (req, res) => {
  console.log('Received request to add dish:', req.body);
  upload(req, res, async (err) => {
    if (err) {
      console.error('Error uploading image:', err);
      return res.status(500).json({ success: false, message: 'Error uploading image', error: err });
    }

    try {
      const { dishCode, dishName, quantity, dishPrice, dishCategory, restaurant, dishDescription } = req.body;
      const imageUrl = req.file ? `/uploads/images/${req.file.filename}` : '';

      // Check if the restaurant already exists
      let existingRestaurant = await Restaurant.findOne({ restaurant });

      // If the restaurant doesn't exist, create it
      if (!existingRestaurant) {
        const newRestaurant = new Restaurant({
          restaurant,
          dishCategory
        });
        existingRestaurant = await newRestaurant.save();
      }

      // Create the new dish
      const newDish = new Dish({
        dishCode,
        dishName,
        quantity,
        dishPrice,
        dishCategory,
        restaurant,
        dishDescription,
        imageUrl
      });

      await newDish.save();
      console.log('New dish created:', newDish);
      res.status(201).json({ success: true, dish: newDish });
    } catch (error) {
      console.error('Error creating dish:', error);
      res.status(500).json({ success: false, message: 'Error creating dish', error });
    }
  });
});

// Route to update dish details

router.put('/dishes/:dishCode', (req, res) => {
  console.log(req.body); // Log the request body to see what's received
  console.log(req.body)
  upload(req, res, async (err) => {
    if (err) {
      console.error('Error uploading image:', err);
      return res.status(500).json({ success: false, message: 'Error uploading image', error: err });
    }
    try {
      const { dishName, dishPrice, quantity, dishCategory, restaurant, dishDescription } = req.body;
      let imageUrl;
      if (req.file) {
        imageUrl = '/uploads/images/' + req.file.filename; // Path to the uploaded file
      }
      const updatedFields = {};
      if (dishName) updatedFields.dishName = dishName;
      if (dishPrice) updatedFields.dishPrice = dishPrice;
      if (quantity) updatedFields.quantity = quantity;
      if (dishCategory) updatedFields.dishCategory = dishCategory;
      if (restaurant) updatedFields.restaurant = restaurant;
      if (dishDescription) updatedFields.dishDescription = dishDescription;
      if (imageUrl) updatedFields.imageUrl = imageUrl;

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
});

// POST route to add conference space
router.post('/conferences', uploadMultiple, async (req, res) => {
  try {
    console.log('Files:', req.files); // Log the files object
    console.log('Body:', req.body); // Log the body object

    const {
      venueName, address, gpsCoordinates, seatingCapacity, layoutOptions, roomDimensions,
      avEquipment, cateringServices, wiFiAccess, airConditioning, parkingFacilities,
      accessibility, pricingStructure, bookingAvailability, paymentOptions,
      eventPlanningAssistance, decorationServices, transportServices, securityServices,
      contactPerson, phoneNumber, emailAddress
    } = req.body;

    const venueImages = req.files['venueImages'] ? req.files['venueImages'].map(file => file.path) : [];
    const videoTours = req.files['videoTours'] ? req.files['videoTours'][0].path : '';
    const floorPlans = req.files['floorPlans'] ? req.files['floorPlans'][0].path : '';

    const newConference = new Conference({
      venueName, address, gpsCoordinates, seatingCapacity, layoutOptions, roomDimensions,
      avEquipment, cateringServices, wiFiAccess, airConditioning, parkingFacilities,
      accessibility, pricingStructure, bookingAvailability, paymentOptions,
      venueImages, videoTours, floorPlans, eventPlanningAssistance, decorationServices,
      transportServices, securityServices, contactPerson, phoneNumber, emailAddress
    });

    const savedConference = await newConference.save();
    res.status(201).json(savedConference);

  } catch (error) {
    console.error('Error adding conference space:', error);
    res.status(500).json({ error: 'Failed to add conference space.' });
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

// Endpoint to get dishes by category
router.get('/category-dishes', async (req, res) => {
  try {
    const category = req.query.category;

    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    const dishes = await Dish.find({ dishCategory: category });

    // Group dishes by restaurant
    const groupedDishes = dishes.reduce((acc, dish) => {
      if (!acc[dish.restaurant]) {
        acc[dish.restaurant] = [];
      }
      acc[dish.restaurant].push(dish);
      return acc;
    }, {});

    res.json(groupedDishes);
  } catch (error) {
    console.error('Error fetching dishes by category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// fetch restaurants for menu
router.get('/restaurants', async (req, res) => {
  try {
    const restaurants = await Dish.distinct('restaurant');
    res.json({ restaurants });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

// Modified endpoint to fetch dishes by restaurant
router.get('/restaurant-dishes', async (req, res) => {
  try {
    const { restaurant, sortBy } = req.query;
    let query = {};

    // If restaurant is provided, filter by restaurant
    if (restaurant) {
      query.restaurant = restaurant;
    }

    // Sort by popular or all dishes (sortBy can be 'popular' or 'all')
    let sortOptions = {};
    if (sortBy === 'popular') {
      sortOptions = { orderCount: -1 }; // Sort by orderCount descending for popular dishes
    }

    const dishes = await Dish.find(query).sort(sortOptions);
    res.json({ message: 'Dishes retrieved successfully', dishes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve dishes', message: error.message });
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
        status: order.status
      };
    });

    // Send the formatted orders as a response
    res.status(200).json(formattedOrders);
  } catch (error) {
    console.error('Error retrieving orders:', error);
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
});
// Endpoint to retrieve orders by user ID
router.get('/user/orders', async (req, res) => {
  const userId = req.user._id; // Assuming you have user authentication in place and req.user contains the logged-in user info

  try {
    const orders = await Order.find({ userId });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
//find orders by id
router.get('/orders/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// PUT route to mark an order as delivered

// router.put('/orders/:orderId/deliver', async (req, res) => {
//   try {
//     const orderId = req.params.orderId;
//     const order = await Order.findOne({ orderId });
//     if (!order) {
//       return res.status(404).json({ message: 'Order not found' });
//     }

//     order.delivered = true;

//     await order.save();

//     res.json({ message: 'Order marked as delivered', order });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Server error');
//   }
// });
//make special orders
router.post('/special-orders', async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryLocation,
      deliveryDate,
      deliveryTime,
      orderDetails,
      specialInstructions
    } = req.body;
    const newOrder = new SpecialOrder({
      customerName,
      customerEmail,
      customerPhone,
      deliveryLocation,
      deliveryDate,
      deliveryTime,
      orderDetails,
      specialInstructions,
      status: 'pending' // or any other initial status
    });
    await newOrder.save();
    res.status(201).send({ message: 'Special order placed successfully!' });
  } catch (error) {
    console.error('Error placing special order:', error);
    res.status(500).send({ message: 'Failed to place the order. Please try again.' });
  }
});
router.post('/submit-event-order', (req, res) => {
  const { name, email, phone, eventDate, eventLocation, message } = req.body;

  // Validate the request body
  if (!name || !email || !phone || !eventDate || !eventLocation) {
    return res.status(400).send('All fields are required');
  }

  // Create a new event order
  const eventOrder = new EventOrder({
    name,
    email,
    phone,
    eventDate,
    eventLocation,
    message
  });

  // Save to the database
  eventOrder.save()
    .then(() => res.status(200).send('Event order submitted successfully'))
    .catch(err => {
      console.error('Error saving event order:', err);
      res.status(500).send('Internal Server Error');
    });
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

router.get('/userSearchHistory', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required' });
  }

  try {
    const userSearchHistory = await UserSearchHistory.find({ userId }); // Adjust based on your schema
    if (!userSearchHistory) {
      return res.status(404).json({ success: false, message: 'No search history found' });
    }

    res.json({ success: true, searchHistory: userSearchHistory });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
// New track search endpoint
router.post('/trackSearch', async (req, res) => {
  try {
    const { userId, dishCode } = req.body;

    if (!userId || !dishCode || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid or missing parameters' });
    }

    const newSearch = new UserSearchHistory({
      userId: mongoose.Types.ObjectId(userId),
      dishCode
    });
    await newSearch.save();

    res.status(201).json({ message: 'Search history recorded' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

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

    // Set initial status
    orderDetails.status = 'Order received';

    // Validate userId
    if (!orderDetails.userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    // Save order to database
    await saveOrder(orderDetails);

    res.status(200).json({ message: 'Order saved successfully' });
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ error: 'Failed to save order' });
  }
});
// Update order status
router.patch('/updateOrderStatus/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findOneAndUpdate(
        { orderId: orderId },
        { status: status },
        { new: true }
    );

    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order status updated successfully', order });
} catch (error) {
    res.status(500).json({ message: 'Error updating order status', error });
}
});

// Fetch undelivered orders
router.get('/orders/undelivered', async (req, res) => {
  try {
    const orders = await Order.find({ status: { $ne: 'Delivered' } });
    res.json(orders);
  } catch (err) {
    res.status(500).send('Server Error');
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
    deliveryCharges: orderDetails.deliveryCharges,
    totalPrice: orderDetails.totalPrice,
    delivered: false,
    paid: true, // Assuming the payment was successful
    userId: orderDetails.userId,
    status: orderDetails.status 
  });

  try {
    await order.save();
    console.log('Order saved successfully');
  } catch (error) {
    console.error('Error saving order:', error);
    throw error; // Rethrow the error so that it can be handled by the caller
  }
}

// AIRTEL PAYMENTS HANDLING 

const airtelConsumerKey = process.env.AIRTEL_CONSUMER_KEY;
const airtelConsumerSecret = process.env.AIRTEL_CONSUMER_SECRET;
const airtelShortcode = process.env.AIRTEL_SHORTCODE;
const ngrokUrl2 = process.env.NGROK_URL;

// Route to handle Airtel payment 
router.post('/airtel/pay', async (req, res) => {
  const { phoneNumber, amount } = req.body;

  try {
    // Fetch access token
    const authResponse = await axios.post('https://openapi.airtel.africa/auth/oauth2/token', {
      client_id: airtelConsumerKey,
      client_secret: airtelConsumerSecret,
      grant_type: 'client_credentials'
    });

    if (!authResponse.data.access_token) {
      throw new Error('Failed to fetch access token');
    }

    const { access_token } = authResponse.data;

    // Initiate payment
    const paymentData = {
      reference: uuidv4(),
      subscriber: {
        country: "KEN",
        currency: "KES",
        msisdn: phoneNumber
      },
      transaction: {
        amount: amount,
        country: "KEN",
        currency: "KES",
        id: uuidv4()
      }
    };

    const paymentResponse = await axios.post('https://openapi.airtel.africa/merchant/v1/payments/', paymentData, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Payment Response:', paymentResponse.data);
    res.json(paymentResponse.data);
  } catch (error) {
    console.error('Error initiating Airtel payment:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to initiate payment', details: error.message });
  }
});

// Route to handle Airtel callback
router.post('/airtel/callback', (req, res) => {
  const callbackData = req.body;
  console.log('Airtel Callback Received:', callbackData);

  // Your logic to handle the callback data goes here...
  const { transaction, status, description } = callbackData;

  console.log('Transaction ID:', transaction.id);
  console.log('Status:', status);
  console.log('Description:', description);

  if (status === 'SUCCESSFUL') {
    console.log('Payment successful. Update database...');
    // Update your database, notify user, etc.
  } else {
    console.log('Payment failed:', description);
    // Handle failure scenario
  }

  // Respond with a success status to acknowledge receipt
  res.sendStatus(200);
});

// Route to handle saving orders
router.post('/airtel/paidOrder', async (req, res) => {
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
async function saveOrderAirtel(orderDetails) {
  const order = new Order({
    orderId: orderDetails.orderId,
    customerName: orderDetails.customerName,
    phoneNumber: orderDetails.phoneNumber,
    selectedCategory: orderDetails.selectedCategory,
    selectedRestaurant: orderDetails.selectedRestaurant,
    customerLocation: orderDetails.customerLocation,
    expectedDeliveryTime: orderDetails.expectedDeliveryTime,
    dishes: orderDetails.dishes,
    deliveryCharges: orderDetails.deliveryCharges,
    totalPrice: orderDetails.totalPrice,
    delivered: false,
    paid: true, // Assuming the payment was successful
    userId: orderDetails.userId
  });

  await order.save();
}

// Example route to handle sending receipts
router.post('/send-receipt-airtel', async (req, res) => {
  try {
    const { phoneNumber, amount } = req.body;
    await sendReceipt(phoneNumber, amount);
    res.status(200).json({ message: 'Receipt sent successfully' });
  } catch (error) {
    console.error('Error sending receipt:', error);
    res.status(500).json({ error: 'Failed to send receipt' });
  }
});

// Function to send receipt
async function sendReceiptAirtel(phoneNumber, amount) {
  const message = `Thank you for your payment of KES ${amount}. Your order is being processed.`;
  await axios.post('https://sms-gateway-api/send', {
    to: phoneNumber,
    message: message
  });
}

//RATING DISHES AND RESTAURANTS
// Get average rating
router.get('/rating/:item_id/:item_type', async (req, res) => {
  const { item_id, item_type } = req.params;

  try {
    let itemModel;
    if (item_type === 'Dish') {
      itemModel = Dish;
    } else if (item_type === 'Restaurant') {
      itemModel = Restaurant;
    } else {
      return res.status(400).json({ message: 'Invalid item type' });
    }

    const item = await itemModel.findById(item_id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({
      averageRating: item.averageRating.toFixed(2),
      ratingCount: item.ratingCount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get('/dishes-and-restaurants', async (req, res) => {
  try {
    const dishes = await Dish.find().populate('restaurant');
    const restaurants = await Restaurant.find();

    const dishesWithRatings = await Promise.all(dishes.map(async (dish) => {
      const ratings = await Rating.find({ item_id: dish._id, item_type: 'Dish' });
      const averageRating = ratings.length ? (ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length) : 0;
      const ratingCount = ratings.length;
      return { ...dish.toObject(), averageRating, ratingCount };
    }));

    const restaurantsWithRatings = await Promise.all(restaurants.map(async (restaurant) => {
      const ratings = await Rating.find({ item_id: restaurant._id, item_type: 'Restaurant' });
      const averageRating = ratings.length ? (ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length) : 0;
      const ratingCount = ratings.length;
      return { ...restaurant.toObject(), averageRating, ratingCount };
    }));

    res.json({ dishes: dishesWithRatings, restaurants: restaurantsWithRatings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post('/rating', async (req, res) => {
  const { user_id, item_id, item_type, rating } = req.body;

  try {
    // Validate input
    if (!user_id || !item_id || !item_type || rating == null) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Convert user_id to ObjectId
    const userIdObject = new mongoose.Types.ObjectId(user_id);

    // Create a new rating
    const newRating = new Rating({
      user_id: userIdObject,
      item_id,
      item_type,
      rating
    });

    await newRating.save();

    // Update the average rating for the item
    const ratings = await Rating.find({ item_id, item_type });
    const averageRating = ratings.length ? (ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length) : 0;
    const ratingCount = ratings.length;

    let itemModel;

    if (item_type === 'Dish') {
      itemModel = Dish;
    } else if (item_type === 'Restaurant') {
      itemModel = Restaurant;
    } else {
      throw new Error('Invalid item type');
    }

    await itemModel.findByIdAndUpdate(item_id, { averageRating, ratingCount });

    res.status(201).json({ success: true, message: 'Rating submitted successfully' });
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ success: false, message: 'Failed to submit rating' });
  }
});

// TESTMONIALS SECTION 

const testimonials = [
  { message: "The food was amazing and the service was excellent!", name: "John Doe" },
  { message: "A wonderful experience with delicious meals.", name: "Jane Smith" }
];

router.get('/testimonials', (req, res) => {
  res.json({ testimonials });
});
module.exports = router;