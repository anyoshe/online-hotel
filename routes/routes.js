const express = require("express")

const router = express.Router();
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { connect, connection, model, Types } = mongoose;
const { body, validationResult } = require('express-validator'); 

//user  schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Dish Models

const dishSchema = new Schema({
    dishCode: { type: String, required: true, unique: true},
    dishName: { type: String, required: true}, 
    quantity: { type: Number, required: true, default: 1},
    dishPrice: { type: Number, required: true},
    dishCategory: { type: String, required: true},
    restaurant: { type: String, required: true},
    subTotal: {type: Number,  required: false, default: 0},
    dishDescription: { type: String, required: true},
}); 

const Dish = model("Dish", dishSchema);

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
    delivered: { type: Boolean, default: false } 
});
const Order = model('Order', orderSchema);


//adding a new dish

router.post('/dishes', async (req, res) => {
    try {
       const dish = new Dish(req.body);
       await dish.save();
       res.status(201).json({ message: 'Dish added successfully', dish });
    } catch (error) {
       console.error(error);
       res.status(500).json({ error: 'Failed to add dish', message: error.message });
    }
   });

   // Route to update dish details
router.put('/dishes/:dishCode', [
    // Validate request body
    body('dishName').optional().isString(),
    body('dishPrice').optional().isNumeric(),
    body('Quantity').optional().isNumeric(),
    body('dishCategory').optional().isString(),
    body('restaurant').optional().isString(),
    body('dishDescription').optional().isString()
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const dishCode = req.params.dishCode;
        const updatedFields = {};

        // Check which fields are provided in the request and update accordingly
        if (req.body.dishName) {
            updatedFields.dishName = req.body.dishName;
        }
        if (req.body.dishPrice) {
            updatedFields.dishPrice = req.body.dishPrice; 
        }
        if (req.body.Quantity) {
            updatedFields.Quantity = req.body.Quantity;
        }
        if (req.body.dishCategory) {
            updatedFields.dishCategory = req.body.dishCategory;
        }
        if (req.body.restaurant) {
            updatedFields.restaurant = req.body.restaurant;
        }
        if (req.body.dishDescription) {
            updatedFields.dishDescription = req.body.dishDescription;
        }

        // Update the dish in the database
        const updatedDish = await Dish.findOneAndUpdate({ dishCode: dishCode }, updatedFields, { new: true });

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
        return res.json({dishes});
      }
      const lowerCaseRestaurantName = restaurantName.toLowerCase(); // Convert to lowercase
      // Replace with your actual database query logic
       // Replace with your actual database query logic with case-insensitive comparison
    const dishes = await Dish.find({ restaurant: { $regex: lowerCaseRestaurantName, $options: 'i' } }).exec();
      res.json({dishes}); 
    } catch (error) {
      console.error('Error fetching dishes:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  // working with orders from the customer

  //Function to generate custom order IDs
async function generateOrderId() {
    const latestOrder = await Order.findOne({}, {}, { sort: { 'createdAt' : -1 } });
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

module.exports = {  Order, createOrder};
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
                createdAt: order.createdAt
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

// Route to mark an order as delivered
router.put('/orders/:orderId/delivered', async (req, res) => {
    const orderId = req.params.orderId;

    try {
        // Find the order by orderId and update its delivered status
        const order = await Order.findOneAndUpdate({ orderId: orderId }, { delivered: true }, { new: true });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Send success response
        res.status(200).json({ message: 'Order marked as delivered successfully' });
    } catch (error) {
        console.error('Error marking order as delivered:', error);
        res.status(500).json({ error: 'Failed to mark order as delivered' });
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


module.exports = router; 