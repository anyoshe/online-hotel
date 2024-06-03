//adding a new dish to database
document.getElementById('openModalBtn').addEventListener('click', function () {
    document.getElementById('modalContainer').classList.remove('hidden');
});

document.getElementById('addDishForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the form from submitting normally


    document.getElementById('submitButton').addEventListener('click', async (event) => {
        event.preventDefault(); // Prevent default button click behavior

        // Gather dish data from the form
        const dishData = {
            dishCode: document.getElementById('dishCode').value,
            dishName: document.getElementById('dishName').value,
            Quantity: document.getElementById('quantity').value,
            dishPrice: document.getElementById('dishPrice').value,
            dishCategory: document.getElementById('dishCategory').value,
            restaurant: document.getElementById('restaurant').value,
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
        } catch (error) {
            console.error(error);
            alert('Failed to add dish'); // Display error message
        }
        document.getElementById('modalContainer').classList.add('hidden');
    });

});
document.getElementById('closeModalBtn').addEventListener('click', function () {
    document.getElementById('modalContainer').classList.add('hidden');
});

//updating an existing dish in the database
document.getElementById('updateModalBtn').addEventListener('click', function () {
    document.getElementById('updateModalContainer').classList.remove('hidden');
});

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
        document.getElementById('updateDishCategory').value = data.dishCategory || '';
        document.getElementById('updateRestaurant').value = data.restaurant || '';
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
    document.getElementById('updateModalContainer').classList.add('hidden');
});
document.getElementById('closeUpdateModalBtn').addEventListener('click', function () {
    document.getElementById('updateModalContainer').classList.add('hidden');
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
    const dishDetailsContainer = document.getElementById('dishDetailsContainer');
    dishDetailsContainer.innerHTML = `<p>Loading dish details...</p>`;
    // Make a fetch request to get dish details

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


//Function to fetch all undelivered orders
async function fetchAndDisplayUndeliveredOrders() {
    try {
        const response = await fetch('http://localhost:3000/api/orders');
        const orders = await response.json();
        console.log('Fetched orders:', orders);
        if (Array.isArray(orders)) {
            const undeliveredOrders = orders.filter(order => !order.delivered);
            // const deliveredOrders = orders.filter(order => order.delivered);
            displayUndeliveredOrders(undeliveredOrders);
            // displayDeliveredOrders(deliveredOrders);

            const totalSales = undeliveredOrders.reduce((acc, undeliveredOrders) => acc + undeliveredOrders.totalPrice, 0);
            const commissionExpected = totalSales * 0.1;
            document.getElementById('totalSalesExpected').textContent = totalSales.toFixed(2);
            document.getElementById('commissionExpected').textContent = commissionExpected.toFixed(2);
        } else {
            console.error('Invalid data received. Unexpected response format.');
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to fetch orders');
    }
}
//Display all undelivered orders
function displayUndeliveredOrders(orders) {
    console.log('orders type:', typeof orders);

    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = ''; // Clear previous orders
    // Step 1: Group orders by restaurant type
    const groupedOrders = orders.reduce((acc, order) => {
        const key = order.selectedRestaurant;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(order);
        return acc;
    }, {});

    // Step 2: Display only undelivered orders
    Object.keys(groupedOrders).forEach(restaurantType => {
        const restaurantSection = document.createElement('div');
        restaurantSection.id = `${restaurantType}-section`;
        restaurantSection.innerHTML = `
                <h2>${restaurantType}</h2>
                <hr>
                <ul id="orders-${restaurantType}">
                    <!-- Orders will be appended here -->
                </ul>
            `;

        ordersList.appendChild(restaurantSection);

        groupedOrders[restaurantType].forEach(order => {
            if (!order.delivered) {
                const orderElement = document.createElement('div');
                orderElement.id = 'orderDetails';
                orderElement.innerHTML = `
                <p>Order ID: ${order.orderId}</p>
                <p>Customer Name: ${order.customerName}</p>
                <p>Phone Number: ${order.phoneNumber}</p>
                <p>Dish Category: ${order.selectedCategory}</p>
                <p>Location: ${order.customerLocation}</p>
                <p>Expected Delivery Time: ${order.expectedDeliveryTime}</p>
                <p>Dishes Ordered:</p>
                <ul>
                    ${order.orderedDishes.map(dish => `<li>${dish.dishName} - Quantity: ${dish.quantity}</li>`).join('')}
                </ul>
                <p>Total Price: Kes.${order.totalPrice}.00</p>
                <p>Created At: ${order.createdAt}</p>
                <button onclick="markAsDelivered('${order.orderId}')">Mark Delivered</button>
            
            `;
                document.getElementById(`orders-${restaurantType}`).appendChild(orderElement);
            }
        });
    });
}
const fetchOrdersButton = document.getElementById('fetchOrdersButton');
fetchOrdersButton.addEventListener('click', fetchAndDisplayUndeliveredOrders)

async function markAsDelivered(orderId) {
    try {
        const response = await fetch(`http://localhost:3000/api/orders/${orderId}/deliver`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error status: ${response.status}`);
        }

        const responseData = await response.json();
        alert('Order Marked as delivered successfully');
        console.log('Order marked as delivered successfully.', responseData);

        // Update UI using a separate function
        await updateOrdersUI(orderId);

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to mark order as delivered.');
    }
}

function calculateTotalSales(orders) {
    return orders.reduce((acc, order) => acc + order.totalPrice, 0);
}
async function updateOrdersUI(orderId) {
    try {
        // Re-fetch all orders to ensure updated data
        const response = await fetch('http://localhost:3000/api/orders');
        const orders = await response.json();

        // Filter delivered and undelivered orders
        const deliveredOrders = orders.filter(order => order.delivered);
        updateSalesList(deliveredOrders); // Pass only delivered orders
        const undeliveredOrders = orders.filter(order => !order.delivered);

        // Update undelivered order list efficiently
        displayUndeliveredOrders(undeliveredOrders);

        // Update sales list efficiently
        const groupedSales = updateSalesList(deliveredOrders); // Pass delivered orders only

        // Calculate and display totals
        const totalSales = calculateTotalSales(deliveredOrders);
        const commissionDue = totalSales * 0.1;
        document.getElementById('totalSales').textContent = totalSales.toFixed(2);
        document.getElementById('commissionDue').textContent = commissionDue.toFixed(2);
        document.getElementById('totalDeliveries').textContent = deliveredOrders.length;

    } catch (error) {
        console.error('Error fetching orders:', error);
    }
}

async function updateSalesList(deliveredOrders) {

    const salesList = document.getElementById('salesList');
    salesList.innerHTML = ''; // Clear previous entries

    const groupedSales = deliveredOrders.reduce((acc, order) => {
        const restaurant = order.selectedRestaurant;
        if (!acc[restaurant]) {
            acc[restaurant] = {
                restaurantName: restaurant,
                orderIds: [],
                totalPrice: 0,
                paid: false
            };
        }
        acc[restaurant].orderIds.push(order.orderId);
        acc[restaurant].totalPrice += order.totalPrice;
        return acc;
    }, {});

    // Display grouped sales data
    Object.values(groupedSales).forEach(restaurantData => {
        const salesItem = document.createElement('div');
        salesItem.classList.add('sales-item');
        // Add 'paid' class if applicable
        const classNameToAdd = restaurantData.paid? 'paid' : '';
        if (classNameToAdd) {
            salesItem.classList.add(classNameToAdd); 
        }
        salesItem.innerHTML = `
        <h3><span>${restaurantData.restaurantName}</span></h3> 
        <ul> 
        <p>Order IDs:</p>
        ${restaurantData.orderIds.map(orderId => `<li>${orderId}</li>`).join('')} 
    
    
        </ul>
        <p>Total Sales: Kes.<span>${restaurantData.totalPrice.toFixed(2)}</span></p>
        <button onClick="markPaid('${restaurantData.restaurantName}', [${restaurantData.orderIds.map(orderId => `'${orderId}'`).join(', ')}])">Paid</button>
        
      `;
        salesList.appendChild(salesItem);
    });
    return groupedSales; // Return grouped sales data
}


document.getElementById('fetchSalesButton').addEventListener('click', () => {
    // Assuming fetchAndDisplayAllOrders is responsible for displaying the sales list
    updateOrdersUI();
});



async function markPaid(restaurantName, orderIds) {
    try {
        console.log(restaurantName, orderIds);
        const response = await fetch('http://localhost:3000/api/updatePaidStatus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // body: JSON.stringify({ test: 'success' })
            body: JSON.stringify({ restaurant: restaurantName, orderIds: orderIds })
        });
        console.log(restaurantName, orderIds);
  
        const result = await response.json();
        console.log(result.message); // Log success message from the backend
        console.log("Attempting to remove salesItem...");

const salesItems = document.querySelectorAll('.sales-item');

salesItems.forEach(item => {
    const restaurantNameElement = item.querySelector('h3 span');
    console.log(`Comparing ${restaurantNameElement.textContent.trim()} with ${restaurantName}`);

    // Compare only the restaurant name
    if (restaurantNameElement.textContent.trim() === restaurantName.trim()) {
        console.log("Removing item because restaurant names match");
        item.remove();
    } else {
        console.log("Condition not met - restaurant names do not match");
    }
});
console.log("Removed salesItem.");
    } catch (error) {
        console.error('Error updating paid status:', error);
    }
}

console.log("Finished processing sales items.");

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('searchButton').addEventListener('click', async () => {
        console.log("Search button clicked");
        const searchQuery = document.getElementById('searchQuery').value.trim();
        const searchType = document.getElementById('searchType').value.trim();

        if (!searchQuery) {
            alert('Please enter a search query');
            return;
        }

        if (!searchType) {
            alert('Please select a search type');
            return;
        }
        console.log("About to fetch data...");
        console.log(`Sending request to server with query: ${searchQuery}, type: ${searchType}`);


        try {
            const response = await fetch(`http://localhost:3000/api/search?query=${encodeURIComponent(searchQuery)}&type=${encodeURIComponent(searchType)}`);
            console.log("Fetch completed", response);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Search failed');
            }

            const results = data.results;
            const searchResults = document.getElementById('searchResults');
            searchResults.innerHTML = ''; // Clear previous results

            if (!results.length) {
                searchResults.innerHTML = '<p>No results found.</p>';
                return;
            }

            let content = '';
            switch (searchType) {
                case 'dishes':
                    content = results.map(dish => `
                        <div>
                            <h3>${dish.dishName}</h3>
                            <p>Price: ${dish.dishPrice}</p>
                            <p>Category: ${dish.dishCategory}</p>
                            <p>Restaurant: ${dish.restaurant}</p>
                            <p>Description: ${dish.dishDescription}</p>
                        </div>
                    `).join('');
                    break;
                case 'restaurants':
                    content = results.map(restaurant => `
                        <div>
                            <h3>${restaurant.restaurant}</h3>
                            <p>Cuisine: ${restaurant.dishCategory}</p>
                            <p>Average Price: ${restaurant.averagePrice}</p>
                        </div>
                    `).join('');
                    break;
                case 'categories':
                    content = results.map(category => `
                        <div>
                            <h3>${category.dishCategory}</3>
                            <p>Description: ${category.dishDescription}</p>
                        </div>
                    `).join('');
                    break;
            }

            searchResults.innerHTML = content;
        } catch (error) {
            console.error('Error fetching data:', error);
            alert(error.message);
        }

    });

});

