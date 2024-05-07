//adding a new dish to database
document.getElementById('submitButton').addEventListener('click', async (event) => {
    event.preventDefault(); // Prevent default button click behavior

    // Gather dish data from the form
    const dishData = {
        dishCode: document.getElementById('dishCode').value,
        dishName: document.getElementById('dishName').value,
        Quantity: document.getElementById('quantity').value,
        dishPrice: document.getElementById('dishPrice').value,
        dishDescription: document.getElementById('dishDescription').value
    };

    try {
        // Send a POST request to add the dish
        const response = await fetch('http://localhost:3000/api/dishes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dishData)
        });

        const data = await response.json();
        alert(data.message) // Display success message
        document.getElementById('addDishForm').reset();
        // Optionally, you can redirect the user or perform other actions after successful addition
    } catch (error) {
        console.error(error);
        alert('Failed to add dish'); // Display error message
    } 
});
 
//updating an existing dish in the database
document.getElementById('updateDishForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    const form = event.target;
    const formData = new FormData(form);
    const dishCode = formData.get('dishCode');

    try {
        // Fetch dish details using the provided dish code
        const response = await fetch(`http://localhost:3000/api/dishes/${dishCode}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch dish details');
        }

        // Populate form fields with fetched dish details
        document.getElementById('updateDishName').value = data.dishName || '';
        document.getElementById('updateDishPrice').value = data.dishPrice || '';
        document.getElementById('updateQuantity').value = data.Quantity || '';
        document.getElementById('updateDishDescription').value = data.dishDescription || '';

        // Send PUT request to update the dish
        const putResponse = await fetch(`http://localhost:3000/api/dishes/${dishCode}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Object.fromEntries(formData.entries()))
        });

        const putData = await putResponse.json();
        if (!putResponse.ok) {
            throw new Error(putData.message || 'Failed to update dish');
        }

        alert(putData.message); // Display success message
        form.reset(); // Clear the form fields
    } catch (error) {
        console.error(error);
        alert(error.message || 'An error occurred'); // Display error message
    }
});


//delete a dish 


async function deleteDish(identifier) {
    try {
        const response = await fetch(`http://localhost:3000/api/dishes/${identifier}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        alert(data.message); // Display success message
        //clear the field
        document.getElementById('dishIdentifier').value = "";
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete dish'); // Display error message
    }
}

function confirmDeleteDish() {
    const identifier = document.getElementById('dishIdentifier').value;

    if (!identifier) {
        alert("Please enter a valid dish code or name.");
        return;
    }

    if (confirm("Are you sure you want to delete this dish?")) {
        deleteDish(identifier);
    }
}

function getDishDetails() {
    const identifier = document.getElementById('dishIdentifier').value;
    // Fetch dish details from server based on identifier and display them in HTML
    // Adjust this part based on how you fetch and display the dish details
    const dishDetailsContainer = document.getElementById('dishDetailsContainer');
    dishDetailsContainer.innerHTML = `<p>Loading dish details...</p>`;
    // Make a fetch request to get dish details
    // Once you receive the details, update the dishDetailsContainer with the information
    // For now, let's just display the identifier
    dishDetailsContainer.innerHTML = `<p>Dish Identifier: ${identifier} Dish Name: ${identifier.dishName} </p>`;
   // document.getElementById('dishIdentifier').value = '';
}

async function searchDish() {  
    const searchQuery = document.getElementById('searchQuery').value;

    try {
        const response = await fetch(`http://localhost:3000/api/dishes/search?query=${searchQuery}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to search dish');
        }

        const dish = data.dish;
        const searchResults = document.getElementById('searchResults');

        // Display dish details
        searchResults.innerHTML = `
            <h3>Dish Details</h3>
            <p>Dish Code: ${dish.dishCode}</p>
            <p>Dish Name: ${dish.dishName}</p>
            <p>Quantity: ${dish.Quantity}</p>
            <p>Price: ${dish.dishPrice}</p>
            <p>Description: ${dish.dishDescription}</p>
        `;
         // Clear the search input field
         document.getElementById('searchQuery').value = '';
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Failed to search dish');
    }
}


// Function to fetch all dishes    
async function fetchAllDishes() {
    try {
        const response = await fetch('http://localhost:3000/api/dishes');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        const dishes = responseData.dishes; // Access the dishes array from the response object
        displayDishes(dishes);

        // const dishes = await response.json();
        // displayDishes(dishes);
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to fetch dishes');
    }
}

// Function to display dishes
function displayDishes(dishes) {
    const dishContainer = document.getElementById('dishContainer');
    dishContainer.innerHTML = ''; // Clear previous dishes
    if (!Array.isArray(dishes)) {
        console.error('Error: Expected an array of dishes, received:', dishes);
        alert('Failed to display dishes');
        return;
    }
    dishes.forEach(dish => {
        const dishElement = document.createElement('div');
        dishElement.innerHTML = `
            <p>Dish Code: ${dish.dishCode}</p>
            <p>Dish Name: ${dish.dishName}</p>
            <p>Quantity: ${dish.quantity}</p>
            <p>Dish Price: ${dish.dishPrice}</p>
        `;
        dishContainer.appendChild(dishElement);
    }); 
}

// 

// Fetch pending orders

// Function to fetch and display orders
// async function fetchAndDisplayAllOrders() {
//     try {
//         const response = await fetch('http://localhost:3000/api/orders');
//         const orders = await response.json();
        
//         // Display orders
//         displayOrders(orders);
        
//         // Calculate and display expected total sales and commission
//         const totalSales = orders.reduce((acc, order) => acc + order.totalPrice, 0);
//         const commissionExpected = totalSales * 0.1;
//         document.getElementById('totalSalesExpected').textContent = totalSales;
//         document.getElementById('commissionExpected').textContent = commissionExpected;
//     } catch (error) {
//         console.error('Error:', error);
//         alert('Failed to fetch orders');
//     }
// }

// // Function to display orders
// function displayOrders(orders) {
//     const ordersList = document.getElementById('ordersList');
//     ordersList.innerHTML = ''; // Clear previous orders

//     orders.forEach(order => {
//         const orderElement = document.createElement('div');
//         orderElement.innerHTML = `
//             <p>Order ID: ${order.orderId}</p>
//             <p>Customer Name: ${order.customerName}</p>
//             <p>Phone Number: ${order.phoneNumber}</p>
//             <p>Location: ${order.customerLocation}</p>
//             <p>Expected Delivery Time: ${order.expectedDeliveryTime}</p>
//             <p>Dishes Ordered:</p>
//             <ul>
//                 ${order.orderedDishes.map(dish => `<li>${dish.dishName} - Quantity: ${dish.quantity}</li>`).join('')}
//             </ul>
//             <p>Total Price: Kes.${order.totalPrice}</p>
//             <p>Created At: ${order.createdAt}</p>
//             <button onclick="markAsDelivered('${order.orderId}')">Mark Delivered</button>
        
//         `;
//         ordersList.appendChild(orderElement);
//         console.log(ordersList);
//     });
// }


// // Fetch and display orders when the page loads
// window.onload = fetchAndDisplayAllOrders;

// // Function to mark an order as delivered

// async function markAsDelivered(orderId) {
//     try {
        
//         console.log('Marking order as delivered:', orderId); // Debugging statement
        

//         const response = await fetch(`http://localhost:3000/api/orders/${orderId}/delivered`, { method: 'PUT' });
//         console.log('Response:', response); // Debugging statement
//         if (!response.ok) {
//             throw new Error('Failed to mark order as delivered');
//         }
//         console.log('Order marked as delivered successfully');
//         // Remove the marked order from the list
//         const index = orders.findIndex(order => order.orderId === orderId);
//         if (index !== -1) {
//             orders.splice(index, 1);
//             displayOrders(orders);
//         }
//     } catch (error) {
//         console.error('Error marking order as delivered:', error);
//         alert('Failed to mark order as delivered');
//     }
// }

// Function to display only undelivered orders
function displayUndeliveredOrders(orders) {
    const undeliveredOrders = orders.filter(order => !order.delivered);
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = ''; // Clear previous orders

    undeliveredOrders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.innerHTML = `
            <p>Order ID: ${order.orderId}</p>
            <p>Customer Name: ${order.customerName}</p>
            <p>Phone Number: ${order.phoneNumber}</p>
            <p>Location: ${order.customerLocation}</p>
            <p>Expected Delivery Time: ${order.expectedDeliveryTime}</p>
            <p>Dishes Ordered:</p>
            <ul>
                ${order.orderedDishes.map(dish => `<li>${dish.dishName} - Quantity: ${dish.quantity}</li>`).join('')}
            </ul>
            <p>Total Price: Kes.${order.totalPrice}</p>
            <p>Created At: ${order.createdAt}</p>
            <button onclick="markAsDelivered('${order.orderId}')">Mark Delivered</button>
        
        `;
        ordersList.appendChild(orderElement);
        console.log(ordersList);
    });
}

// Fetch and display only undelivered orders when the page loads

// Function to display orders
function displayOrders(orders) {
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = ''; // Clear previous orders

    orders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.innerHTML = `
            <p>Order ID: ${order.orderId}</p>
            <p>Customer Name: ${order.customerName}</p>
            <p>Phone Number: ${order.phoneNumber}</p>
            <p>Location: ${order.customerLocation}</p>
            <p>Expected Delivery Time: ${order.expectedDeliveryTime}</p>
            <p>Dishes Ordered:</p>
            <ul>
                ${order.orderedDishes.map(dish => `<li>${dish.dishName} - Quantity: ${dish.quantity}</li>`).join('')}
            </ul>
            <p>Total Price: Kes.${order.totalPrice}</p>
            <p>Created At: ${order.createdAt}</p>
            <button onclick="markAsDelivered('${order.orderId}')">Mark Delivered</button>
        
        `;
        ordersList.appendChild(orderElement);
    });
}

async function fetchAndDisplayUndeliveredOrders() {
    try {
        const response = await fetch('http://localhost:3000/api/orders');
        const orders = await response.json();
        
        // Display only undelivered orders
        displayOrders(orders);
        
        // Calculate and display expected total sales and commission
        const totalSalesExpected = orders.reduce((acc, order) => acc + order.totalPrice, 0);
        const commissionExpected = totalSalesExpected * 0.1;
        document.getElementById('totalSalesExpected').textContent = totalSalesExpected;
        document.getElementById('commissionExpected').textContent = commissionExpected;
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to fetch orders');
    }
}

// Function to mark an order as delivered
async function markAsDelivered(orderId) {
    try {
        const response = await fetch(`http://localhost:3000/api/orders/${orderId}/delivered`, { method: 'PUT' });
        if (response.ok) {
            // If order is successfully marked as delivered
            // Remove the delivered order from the list and display only undelivered orders
            fetchAndDisplayUndeliveredOrders();
        } else {
            console.error('Failed to mark order as delivered');
        }
    } catch (error) {
        console.error('Error marking order as delivered:', error);
        alert('Failed to mark order as delivered');
    }
}

// Fetch and display only undelivered orders when the page loads
window.onload = fetchAndDisplayUndeliveredOrders;

