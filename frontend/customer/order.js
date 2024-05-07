// Fetch dishes from backend
async function fetchDishes() {
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
        const dishesContainer = document.getElementById('dishesContainer');
        dishes.forEach(dish => {
            const dishDiv = document.createElement('div');
            dishDiv.classList.add('dish');

            // Display dish details
            const dishName = document.createElement('h4');
            dishName.textContent = dish.dishName;
            dishDiv.appendChild(dishName);

            const price = document.createElement('p');
            price.textContent = `Price: Kes.${(dish.dishPrice * 1.2).toFixed(2)}`;
            dishDiv.appendChild(price);

            const description = document.createElement('p');
            description.textContent = dish.dishDescription;
            dishDiv.appendChild(description);

            // Add to cart button
            const addToCartButton = document.createElement('button');
            addToCartButton.textContent = 'Add to Cart';
            addToCartButton.addEventListener('click', () => addToCart(dish));
            dishDiv.appendChild(addToCartButton);

            dishesContainer.appendChild(dishDiv);
        });
    } catch (error) {
        console.error('Error fetching dishes:', error);
    }   
}    
 
// Add selected dish to cart
function addToCart(dish) { 
    // Implement this function to add the selected dish to the cart
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


// Fetch dishes when page loads
window.onload = fetchDishes;
