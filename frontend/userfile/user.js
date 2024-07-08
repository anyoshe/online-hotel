//adding a new dish to database
// document.getElementById('openModalBtn').addEventListener('click', function () {
//     document.getElementById('modalContainer').classList.remove('hidden');
// });

// // Event listener to close the modal
// document.getElementById('closeModalBtn').addEventListener('click', function () {
//     document.getElementById('modalContainer').classList.add('hidden');
// });

// // Event listener for form submission
// document.getElementById('addDishForm').addEventListener('submit', async function (event) {
//     event.preventDefault(); // Prevent the form from submitting normally
//     console.log('Form submitted'); //
//     const formData = new FormData();
//     const imageInput = document.getElementById('imageInput').files[0]; // Assuming your input element for the image has id 'imageInput'

//     formData.append('image', imageInput);
//     formData.append('dishCode', document.getElementById('dishCode').value);
//     formData.append('dishName', document.getElementById('dishName').value);
//     formData.append('quantity', document.getElementById('quantity').value);
//     formData.append('dishPrice', document.getElementById('dishPrice').value);
//     formData.append('dishCategory', document.getElementById('dishCategory').value);
//     formData.append('restaurant', document.getElementById('restaurant').value);
//     formData.append('dishDescription', document.getElementById('dishDescription').value);

//     try {
//         // Send a POST request to add the dish
//         console.log('Sending request to:', 'http://localhost:3000/api/dishes');
//         const response = await fetch('http://localhost:3000/api/dishes', {
//             method: 'POST',
//             body: formData
//         });
// // Check if the response is not okay
// if (!response.ok) {
//     console.log('Response status:', response.status);
//     const data = await response.json();
//     console.log('Response data:', data);
//     throw new Error(data.message || 'Failed to add dish');
// }
//        // Parse the JSON response
//        const data = await response.json();
//        console.log('Success response data:', data); // Log the successful response

//        alert('Dish added successfully!');
//        document.getElementById('addDishForm').reset();


//     } catch (error) {
//         console.error('Fetch error:', error);
//         if (error.message === 'Failed to fetch') {
//             alert('Failed to add dish: Network error or server is unreachable.');
//         } else {
//             alert('Failed to add dish: ' + error.message); 
//         }
//     } finally {
//         document.getElementById('modalContainer').classList.add('hidden');
//     }
// });
// JavaScript
document.getElementById('openModalBtn').addEventListener('click', function () {
    document.getElementById('modalContainer').classList.remove('hidden');
    document.getElementById('messageContainer').innerText = ''; // Clear previous messages
    document.getElementById('loadingIndicator').classList.add('hidden'); // Hide loading indicator
});

document.getElementById('closeModalBtn').addEventListener('click', function () {
    document.getElementById('modalContainer').classList.add('hidden');
    document.getElementById('loadingIndicator').classList.add('hidden'); // Hide loading indicator
});

document.getElementById('addDishForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the form from submitting normally
    console.log('Form submitted');

    const formData = new FormData();
    const imageInput = document.getElementById('imageInput').files[0]; // Assuming your input element for the image has id 'imageInput'

    formData.append('image', imageInput);
    formData.append('dishCode', document.getElementById('dishCode').value);
    formData.append('dishName', document.getElementById('dishName').value);
    formData.append('quantity', document.getElementById('quantity').value);
    formData.append('dishPrice', document.getElementById('dishPrice').value);
    formData.append('dishCategory', document.getElementById('dishCategory').value);
    formData.append('restaurant', document.getElementById('restaurant').value);
    formData.append('dishDescription', document.getElementById('dishDescription').value);

    // Show loading indicator
    document.getElementById('loadingIndicator').classList.remove('hidden');

    // Implement timeout for fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

    try {
        // Send a POST request to add the dish
        console.log('Sending request to:', 'http://localhost:3000/api/dishes');
        const response = await fetch('http://localhost:3000/api/dishes', {
            method: 'POST',
            body: formData,
            signal: controller.signal
        });

        clearTimeout(timeoutId); // Clear the timeout since fetch was successful

        if (!response.ok) {
            const data = await response.json();
            console.log('Response data:', data);
            throw new Error(data.message || 'Failed to add dish');
        }

        const data = await response.json();
        console.log('Success response data:', data); // Log the successful response

        document.getElementById('loadingIndicator').classList.add('hidden'); // Hide loading indicator
        displayMessage('Dish added successfully!', 'success');
        document.getElementById('addDishForm').reset();

    } catch (error) {
        clearTimeout(timeoutId); // Clear the timeout since fetch encountered an error
        console.error('Fetch error:', error);
        // Instead of showing an alert for the error, we log it and show a success message only
        displayMessage('Failed to add dish: Network error or server is unreachable.', 'error');
    } finally {
        document.getElementById('modalContainer').classList.add('hidden');
    }
});

function displayMessage(message, type) {
    const messageContainer = document.getElementById('messageContainer');
    messageContainer.innerText = message;
    messageContainer.className = type;
    setTimeout(() => {
        messageContainer.innerText = '';
        messageContainer.className = '';
    }, 3000);
}



//updating the dish
document.getElementById('updateModalBtn').addEventListener('click', function () {
    document.getElementById('updateModalContainer').classList.remove('hidden');
});

let isFetching = true;

document.getElementById('updateDishForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    const form = event.target;
    const formData = new FormData(form);
    const dishCode = formData.get('dishCode');

    if (isFetching) {
        if (!dishCode) {
            displayMessage('Dish code is required to fetch details.', 'error');
            return;
        }

        try {
            // Fetch dish details using the provided dish code
            const response = await fetch(`http://localhost:3000/api/dishes/${dishCode}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch dish details');
            }
            console.log("Fetched dish details:", data);

            // Populate form fields with fetched dish details
            document.getElementById('updateDishName').value = data.dishName || '';
            document.getElementById('updateDishPrice').value = data.dishPrice || '';
            document.getElementById('updateQuantity').value = data.quantity || '';
            document.getElementById('updateDishCategory').value = data.dishCategory || '';
            document.getElementById('updateRestaurant').value = data.restaurant || '';
            document.getElementById('updateDishDescription').value = data.dishDescription || '';

            if (data.imageUrl) {
                const imgElement = document.createElement('img');
                imgElement.src = data.imageUrl;
                imgElement.style.maxWidth = '100%'; // Adjust styles as needed
                imgElement.style.display = 'none'; // Show the image element
                document.getElementById('updateImagePreview').innerHTML = ''; // Clear previous image previews
                document.getElementById('updateImagePreview').appendChild(imgElement);
            }

            // Display success message non-disruptively
            displayMessage('Dish details fetched successfully. Please proceed with modifications.', 'success');

            isFetching = false; // Set flag to indicate that fetching is done and ready for updating
        } catch (error) {
            console.error(error);
            displayMessage(error.message || 'An error occurred', 'error');
        }
    } else {
        // Update the dish details
        try {
            // Remove dishCode from formData to prevent it from being sent in the body
            formData.delete('dishCode');

            const imageInput = document.getElementById('imageInput').files[0];
            if (imageInput) {
                formData.append('image', imageInput);
            }

            // Send PUT request to update the dish
            const putResponse = await fetch(`http://localhost:3000/api/dishes/${dishCode}`, {
                method: 'PUT',
                body: formData
            });
            const putData = await putResponse.json();
            if (!putResponse.ok) {
                throw new Error(putData.message || 'Failed to update dish');
            }
            else if (putResponse.ok) {
                 console.log("Dish updated successfully:", putData);
                 alert('Dish updated successfully');

            }
                   // Display success message non-disruptively
             displayMessage('Dish updated successfully', 'success');

             // Display success alert
            
             // Reset the form fields after a delay to allow the message to be seen
             setTimeout(() => {
                 form.reset(); // Clear the form fields
                 document.getElementById('updateModalContainer').classList.add('hidden'); // Close the modal after successful update
                 isFetching = true; // Reset flag for next operation
             }, 2000); 
        } catch (error) {
            console.error(error);
            displayMessage(error.message || 'An error occurred', 'error');
        }
    }
});
document.getElementById('closeUpdateModalBtn').addEventListener('click', function () {
    document.getElementById('updateModalContainer').classList.add('hidden');
    isFetching = true; // Reset flag when modal is closed
});

// Function to display messages non-disruptively
function displayMessage(message, type) {
    const messageContainer = document.getElementById('messageContainer');
    messageContainer.innerText = message;
    messageContainer.className = type;
    setTimeout(() => {
        messageContainer.innerText = '';
        messageContainer.className = '';
    }, 3000);
}



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
            <p>Quantity: ${dish.quantity}</p>
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
document.addEventListener('DOMContentLoaded', function() {
    fetchAndDisplayUndeliveredOrders();
});
async function fetchAndDisplayUndeliveredOrders() {
    try {
        const response = await fetch('http://localhost:3000/api/orders');
        const orders = await response.json();
        console.log('Fetched orders:', orders);
        if (Array.isArray(orders)) {
            const undeliveredOrders = orders.filter(order => order.status !== 'Delivered');
            displayUndeliveredOrders(undeliveredOrders);

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

     // Filter out orders that are already delivered or have an undefined status
     const validOrders = orders.filter(order => !(order.delivered || order.status === undefined));

     if (validOrders.length > 0) {
    // Step 1: Group orders by restaurant type
    const groupedOrders = validOrders.reduce((acc, order) => {
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
                const orderElement = createOrderElement(order);
                document.getElementById(`orders-${restaurantType}`).appendChild(orderElement);
            }
        });
    });
} else {
    console.log('No undelivered orders to display.');
}
}


// Function to create order element
function createOrderElement(order) {
    const orderElement = document.createElement('div');
    orderElement.id = `order-${order.orderId}`;
    orderElement.className = 'orderDetails';
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
         <p>Status: <span class="order-status">${order.status || 'undefined'}</span></p>
        ${getStatusButtons(order.status, order.orderId)}

    `;

    return orderElement;
}

function getStatusButtons(status, orderId) {
    const statusOrder = ['Order received', 'Processed and packed', 'Dispatched', 'Delivered'];
    const currentIndex = statusOrder.indexOf(status);

    // Calculate the next status
    const nextStatus = statusOrder[currentIndex + 1];

    // Only show the button for the next status if there is one
    if (nextStatus) {
        return `<button class="order-status-btn" onclick="updateOrderStatus('${orderId}', '${nextStatus}')">Mark as ${nextStatus}</button>`;
    } else {
        return ''; // No button needed if the order is already delivered
    }
}


async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(`http://localhost:3000/api/updateOrderStatus/${orderId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        if (!response.ok) {
            throw new Error(`HTTP error status: ${response.status}`);
        }

        const responseData = await response.json();
        alert(`Order status updated to ${status} successfully`);
        console.log(`Order status updated to ${status} successfully.`, responseData);

       
        // Update UI using a separate function
        await updateOrderElement(orderId, status);


    } catch (error) {
        console.error('Error:', error);
        alert(`Failed to update order status to ${status}.`);
    }
}

async function updateOrderElement(orderId, status) {
    try {
      
        const orderElement = document.getElementById(`order-${orderId}`);
        if (orderElement) {
            const statusSpan = orderElement.querySelector('.order-status');
            if (statusSpan) {
                statusSpan.textContent = status;
            } else {
                console.error(`Status span not found for order ID ${orderId}`);
            }

            // Update status button text and behavior
            const buttonContainer = orderElement.querySelector('button');
            if (buttonContainer && status !== 'Delivered') { // Ensure the button exists and the order is not already delivered
                const statusOrder = ['Order received', 'Processed and packed', 'Dispatched', 'Delivered'];
                const currentIndex = statusOrder.indexOf(status);
                buttonContainer.textContent = `Mark as ${statusOrder[currentIndex + 1]}`;
                buttonContainer.setAttribute('onclick', `updateOrderStatus('${orderId}', '${statusOrder[currentIndex + 1]}')`);
            } else if (buttonContainer) {
                buttonContainer.remove(); // Remove the button if the order is already delivered
            }
        } else {
            console.error(`Order element not found for order ID ${orderId}`);
        }
    } catch (error) {
        console.error('Error updating order status:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('fetchSalesButton').addEventListener('click', function() {
        fetchAndDisplayDeliveredOrders();
    });
});

async function fetchAndDisplayDeliveredOrders() {
    try {
        const response = await fetch('http://localhost:3000/api/orders');
        const orders = await response.json();
        console.log('Fetched orders:', orders);
        
        if (Array.isArray(orders)) {
            const deliveredOrders = orders.filter(order => order.status === 'Delivered');
            displayDeliveredOrders(deliveredOrders);

            const totalSales = deliveredOrders.reduce((acc, order) => acc + order.totalPrice, 0);
            const commissionDue = totalSales * 0.1;
            document.getElementById('totalSales').textContent = totalSales.toFixed(2);
            document.getElementById('commissionDue').textContent = commissionDue.toFixed(2);
            document.getElementById('totalDeliveries').textContent = deliveredOrders.length;
        } else {
            console.error('Invalid data received. Unexpected response format.');
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to fetch orders');
    }
}

function displayDeliveredOrders(orders) {
    const salesList = document.getElementById('salesList');
    salesList.innerHTML = ''; // Clear previous sales

    // Get unique dates for the dropdown
    const uniqueDates = [...new Set(orders.map(order => order.createdAt.split('T')[0]))];

    const uniqueRestaurants = [...new Set(orders.map(order => order.selectedRestaurant))];

    // Create table and add dropdown filter in date column header
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Sales Number</th>
                <th>
                    Date
                    <select id="dateFilter">
                        <option value="">All Dates</option>
                        ${uniqueDates.map(date => `<option value="${date}">${date}</option>`).join('')}
                    </select>
                </th>
                <th>Restaurant
                    <select id="restaurantFilter">
                        <option value="">All Restaurants</option>
                        ${uniqueRestaurants.map(restaurant => `<option value="${restaurant}">${restaurant}</option>`).join('')}
                    </select>
                </th>
                <th>Customer Name</th>
                <th>Phone Number</th>
                <th>Sales Amount</th>
            </tr>
        </thead>
        <tbody id="salesBody">
            <!-- Sales will be appended here -->
        </tbody>
    `;

    salesList.appendChild(table);

    const salesBody = document.getElementById('salesBody');

    // Display all delivered orders initially
    orders.forEach(order => {
        const orderElement = createSalesElement(order);
        salesBody.appendChild(orderElement);
    });

    // Add event listener for the date filter dropdown
    document.getElementById('dateFilter').addEventListener('change', (event) => {
        const filterDate = event.target.value;
        filterAndDisplayOrders(orders, filterDate);
    });
    
    document.getElementById('restaurantFilter').addEventListener('change', (event) => {
        const filterRestaurant = event.target.value;
        const filterDate = document.getElementById('dateFilter').value;
        filterAndDisplayOrders(orders, filterDate, filterRestaurant);
    });
}

function filterAndDisplayOrders(orders, filterDate, filterRestaurant) {
    const salesBody = document.getElementById('salesBody');
    salesBody.innerHTML = ''; // Clear previous sales

    // const filteredOrders = filterDate ? orders.filter(order => order.createdAt.split('T')[0] === filterDate) : orders;
    const filteredOrders = orders.filter(order => {
        const orderDate = order.createdAt.split('T')[0];
        return (!filterDate || orderDate === filterDate) &&
               (!filterRestaurant || order.selectedRestaurant === filterRestaurant);
    });
    // Display filtered orders
    filteredOrders.forEach(order => {
        const orderElement = createSalesElement(order);
        salesBody.appendChild(orderElement);
    });

    // Update total sales, commission, and total deliveries
    const totalSales = filteredOrders.reduce((acc, order) => acc + order.totalPrice, 0);
    const commissionDue = totalSales * 0.1;
    document.getElementById('totalSales').textContent = totalSales.toFixed(2);
    document.getElementById('commissionDue').textContent = commissionDue.toFixed(2);
    document.getElementById('totalDeliveries').textContent = filteredOrders.length;
}
function createSalesElement(order) {
    const orderElement = document.createElement('tr');
    orderElement.id = `sale-${order.orderId}`;
    orderElement.className = 'salesDetails';
    orderElement.innerHTML = `
        <td>${order.orderId}</td>
        <td>${order.createdAt.split('T')[0]}</td>
        <td>${order.selectedRestaurant}</td>
        <td>${order.customerName}</td>
        <td>${order.phoneNumber}</td>
        <td>Kes.${order.totalPrice}.00</td>
    `;

    return orderElement;
}

//submit conference form to database
document.getElementById('conferenceForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission
  
    const form = event.target;
    const formData = new FormData(form);
  
    try {
      const response = await fetch('http://localhost:3000/api/conferences', {
        method: 'POST',
        body: formData
      });
  
      if (response.ok) {
        const data = await response.json();
        document.getElementById('statusMessage').textContent = 'Conference space added successfully!';
        console.log('Success:', data);
      } else {
        const errorData = await response.json();
        document.getElementById('statusMessage').textContent = `Error: ${errorData.error}`;
        console.error('Error:', errorData);
      }
    } catch (error) {
      document.getElementById('statusMessage').textContent = 'An error occurred while submitting the form.';
      console.error('Error:', error);
    }
  });
  
//search button
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
