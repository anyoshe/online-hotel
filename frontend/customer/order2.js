// Fetch dishes from backend
async function fetchToSelectDishes() {
    try {
        const response = await fetch('http://localhost:3000/api/dishes');
        const responseData = await response.json();

        // Check if the response contains the expected data structure 
        if (!Array.isArray(responseData.dishes)) { 
            throw new Error('Invalid data format: Expected an array of dishes');     
        }

        // Extract the array of dishes from the response  
        const dishes = responseData.dishes;

        // Proceed with processing the dishes
        const dishDropdown = document.getElementById('dishDropdown');
        dishes.forEach(dish => {
            const option = document.createElement('option');
            option.value = dish.dishCode;
            option.textContent = `${dish.dishName} - Kes. ${(dish.dishPrice * 1.2).toFixed(2)}`;
            dishDropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching dishes:', error);
    }
}



// Add selected dish to cart
function addToCart() {
    const dishDropdown = document.getElementById('dishDropdown');
    const selectedDish = dishDropdown.options[dishDropdown.selectedIndex];
    const quantity = document.getElementById('quantity').value;
    const cartItems = document.getElementById('cartItems');
    const listItem = document.createElement('li');

    // Calculate subtotal
    const dishPrice = parseFloat(selectedDish.textContent.split('Kes.')[1]);
    const subtotal = dishPrice * quantity;

    listItem.textContent = `${selectedDish.textContent} x ${quantity} = ${subtotal}`;
    cartItems.appendChild(listItem);

    
    // Update total price
    const totalPrice = parseFloat(document.getElementById('totalPrice').textContent);
    document.getElementById('totalPrice').textContent = (totalPrice + subtotal).toFixed(2);
}

// Place order

// Place order
function placeOrder() {
    // Get form inputs
    const customerName = document.getElementById('customerName').value; 
    const phoneNumber = document.getElementById('phoneNumber').value;
    const customerLocation = document.getElementById('customerLocation').value;
    const expectedDeliveryTime = document.getElementById('expectedDeliveryTime').value;

    // Check if all required fields are filled
    if (!customerName || !phoneNumber || !customerLocation || !expectedDeliveryTime) {
        alert('Please fill in all required fields.');
        return;
    }

    // Get the list of ordered dishes from the cart
    const cartItems = document.getElementById('cartItems').getElementsByTagName('li');
    const orderedDishes = Array.from(cartItems).map(item => {
        const parts = item.textContent.split(' x ');
        const dishNameAndPrice = parts[0]; // Dish Name and Price are in the first part
        const quantity = parseInt(parts[1]);   

        // Split the dishNameAndPrice to extract dishName and price
        const dishName = dishNameAndPrice.split(' - ')[0];
        const price = parseFloat(dishNameAndPrice.split(' - ')[1].substring(5)); // Extract the price from the second part

        const dishCode = dishName.split(' - ')[0];
        return { dishCode, dishName, quantity, price };
    });

    // Calculate total price
    let totalPrice = 0;
    orderedDishes.forEach(dish => {
        totalPrice += dish.price * dish.quantity;
    });

    // Create the order object 
    const orderData = {
        customerName,
        phoneNumber,
        customerLocation,
        expectedDeliveryTime,
        dishes: orderedDishes,
        totalPrice,
    };

    // Send the order data to the server
    fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        alert('Order placed successfully!');
        // Clear the form after successful submission
        document.getElementById('customerName').value = ''; 
        document.getElementById('phoneNumber').value = '';
        document.getElementById('customerLocation').value = '';
        document.getElementById('expectedDeliveryTime').value = ''; // Reset time input field
        document.getElementById('totalPrice').textContent = '0';
        document.getElementById('cartItems').innerHTML = '';  
    })
    .catch(error => {
        console.error('Error:', error);
        displayMessage('Failed to place order', 'error');
    });
}

function displayMessage(message, type) {
    const messageContainer = document.getElementById('messageContainer');
    const alertClass = (type === 'error') ? 'alert-danger' : 'alert-success';
    messageContainer.innerHTML = `<div class="alert ${alertClass}" role="alert">${message}</div>`;
}

// function placeOrder()  placing order from display


window.onload = fetchToSelectDishes; 
