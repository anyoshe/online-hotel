document.addEventListener('DOMContentLoaded', function() {
  clearCart();
});
//generating the customerLocation
const script = document.createElement("script");
script.src =
  "https://maps.googleapis.com/maps/api/js?key=AIzaSyCmuVWpm0lkdNiq3wWZpEz0XYtDjmoN-wY&callback=initMap&libraries=places&loading=async"; // Replace 'YOUR_API_KEY' with your actual Google Maps API key
script.async = true;
document.head.appendChild(script);

let map;
let marker; // Define marker outside the function

function updateCustomerLocation(newPosition) {
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ location: newPosition }, function (results, status) {
    if (status === "OK") {
      const address = results[0].formatted_address;
      document.getElementById("customerLocation").value = address;
      // Send address data to your order processing logic here
    } else {
      console.error(
        "Geocode was not successful for the following reason: " + status
      );
    }
  });
}

window.initMap = function () {
  if (google && google.maps) {
    map = new google.maps.Map(document.getElementById("mapContainer"), {
      zoom: 15, // Adjust zoom level as needed
    });

    // Get user's current location (if allowed)
    getLocation();
  } else {
    console.error("Google Maps JavaScript API is not loaded.");
  }
};

document.addEventListener("DOMContentLoaded", function () {
  // Hide the map container initially
  document.querySelector(".map-container").style.display = "none";

  // Button click to use current location
  document
    .getElementById("useMyLocationButton")
    .addEventListener("click", function () {
      if (marker) {
        // Use marker's position if already placed
        updateCustomerLocation(marker.getPosition());
      } else {
        console.error("Please set your delivery location.");
      }
    });

  // **Location selection functionality (replace with your existing logic)**
  const locationSelect = document.getElementById("location-select");
  locationSelect.addEventListener("change", function (event) {
    const selectedLocation = event.target.value; // Update selectedLocation here
    updateMap(selectedLocation, map); // Move the call to updateMap here
    document.querySelector(".map-container").style.display = "block"; // Show the map container

    function updateMap(selectedLocation, map) {
      let center;
      switch (selectedLocation) {
        case "malindi":
          center = { lat: -3.2222, lng: 40.1167 }; // Adjust coordinates for Malindi
          break;
        case "watamu":
          center = { lat: -3.3778, lng: 40.0333 }; // Adjust coordinates for Watamu
          break;
        case "kilifi":
          center = { lat: -3.6333, lng: 39.8433 }; // Adjust coordinates for Kilifi
          break;
        case "mombasa":
          center = { lat: -4.05, lng: 39.6667 }; // Adjust coordinates for Mombasa
          break;
        case "lamu":
          center = { lat: -2.26864, lng: 40.90086 }; // Adjust coordinates for Lamu
          break;
        default:
          return; // Handle cases where no location is selected
      }
      if (map) {
        // Use panTo for a smooth transition
        map.panTo(center); // Update map center
        // Add a marker at the selected location
        const marker = new google.maps.Marker({
          position: center,
          map: map,
          title: selectedLocation, // Set a title for the marker (optional)
        });
      } else {
        console.error("Google Maps JavaScript API is not loaded.");
      }
    }
  });
});

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, handleLocationError);
  } else {
    console.error("Geolocation is not supported by this browser.");
  }
}

function handleLocationError(error) {
  console.warn("Error getting location:", error.code);
  // Handle location retrieval error (e.g., permission denied)
}

function showPosition(position) {
  const currentPosition = {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
  };

  // Create a marker and set its position
  marker = new google.maps.Marker({
    position: currentPosition,
    map: map,
    draggable: true, // Allow marker dragging
    title: "Your Location",
  });

  // Update map center to user's location
  map.setCenter(currentPosition);

  // Update delivery address when marker is dragged
  google.maps.event.addListener(marker, "dragend", function (event) {
    updateCustomerLocation(marker.getPosition());
  });
}

//calculate distance
const fallbackCoordinates = {
  "JOHARIS": { lat: -1.3014837036023645, lng: 36.81863427013397 },
  "KIENYEJI CLUB": { lat:-3.215983807798293, lng: 40.11173015525964 },
  "BILLIONAIRE CLUB": { lat:-3.2150307505922235, lng: 40.11619069638544},
 "STARS AND GARTERS": { lat: -3.2101632447638084, lng: 40.11700276546466},
  // Add more restaurants and their coordinates as needed
};

function getRestaurantCoordinates(restaurantName, callback) {
  const geocoder = new google.maps.Geocoder();
  
  // Attempt to geocode the restaurant name
  geocoder.geocode({ address: restaurantName }, function(results, status) {
    if (status === "OK") {
      const location = results[0].geometry.location;
      callback(location); // Use the location coordinates in the callback
    } else {
      console.warn(`Geocode was not successful for ${restaurantName}: ${status}`);
      if (fallbackCoordinates[restaurantName]) {
        const location = fallbackCoordinates[restaurantName];
        callback(new google.maps.LatLng(location.lat, location.lng)); // Use fallback coordinates
      } else {
        console.error(`No fallback coordinates for ${restaurantName}`);
        callback(null); // No coordinates available
      }
    }
  });
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRad = (value) => value * Math.PI / 180;
  
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
}
//   // function addToCart and place order and summary  

document.addEventListener('DOMContentLoaded', function () {
  //localStorage.setItem('cart', JSON.stringify([]));
  document.getElementById('cart2').addEventListener('click', handleCartClick);
  document.getElementById('placeOrderButton').addEventListener('click', placeOrder);
  document.getElementById('confirmOrderButton').addEventListener('click', confirmOrder);
});

let firstDishRestaurant = '';

function addToCart(dishDetails) {
  console.log('Function addToCart called');
  console.log('Adding to cart:', dishDetails);

  const cartItems = document.getElementById("cartItems");
  if (!cartItems) {
    console.error("cartItems element not found in the DOM.");
    return;
  }

  const { dishCode, dishName, dishPrice, dishCategory, restaurant } = dishDetails;
  const price = dishPrice * 1.2; // 20% markup
  const quantity = 1; // Always 1 for now

  const listItem = document.createElement("li");
  const subtotal = price * quantity;
  listItem.textContent = `${dishName} - Kes.${subtotal.toFixed(2)} x ${quantity} = ${subtotal}`;

  // Set the category and restaurant in the dataset
  listItem.dataset.dishCategory = dishCategory;
  listItem.dataset.restaurant = restaurant;

  cartItems.appendChild(listItem);

  const totalPriceElement = document.getElementById("totalPrice");
  if (totalPriceElement) {
    const totalPrice = parseFloat(totalPriceElement.textContent);
    totalPriceElement.textContent = (totalPrice + subtotal).toFixed(2);
  }

  const cartCount = document.getElementById('cartCount');
  if (cartCount) {
    const currentCount = parseInt(cartCount.textContent, 10);
    cartCount.textContent = currentCount + 1;
  }

  // Check if this is the first dish added
  if (!firstDishRestaurant) {
    firstDishRestaurant = restaurant;
  } else {
    // Compare the restaurant of the new dish with the first dish
    if (firstDishRestaurant !== restaurant) {
      // Prompt the user if they want to add dishes from different restaurants
      const userConfirmation = confirm(`You are currently ordering from ${firstDishRestaurant}. Do you want to add dishes from ${restaurant}?`);
      if (!userConfirmation) {
        // User chose not to add dishes from different restaurants
        cartItems.removeChild(listItem); // Remove the item added above
        return;
      }
    }
  }

  // Update localStorage after adding to cart
  const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
  const existingItem = storedCart.find(item => item.dishCode === dishCode);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    storedCart.push({ dishCode, dishName, dishPrice, dishCategory, restaurant, quantity });
  }

  localStorage.setItem('cart', JSON.stringify(storedCart));

  console.log('Cart after addition:', storedCart);
}

function handleCartClick(event) {
  event.preventDefault();
  const isAuthenticated = checkAuthenticationStatus();

  const modal = document.getElementById('orderFormModal');
  modal.style.display = 'block';

  openCartAndShowOrderForm(isAuthenticated);
}

function openCartAndShowOrderForm(isAuthenticated) {
  const orderForm = document.getElementById('orderForm');
  const customerNameField = document.getElementById('customerName');
  const phoneNumberField = document.getElementById('phoneNumber');
  const expectedDeliveryTimeField = document.getElementById('expectedDeliveryTime');
  const customerLocationField = document.getElementById('customerLocation');
  const selectedCategoryField = document.getElementById('selectedCategory');
  const selectedRestaurantField = document.getElementById('selectedRestaurant');

  if (!isAuthenticated) {
    customerNameField.value = '';
    phoneNumberField.value = '';
  }

  const firstDishCategory = getFirstDishCategory();
  const firstDishRestaurant = getFirstDishRestaurant();

  selectedCategoryField.textContent = firstDishCategory ? firstDishCategory : '';
  selectedRestaurantField.textContent = firstDishRestaurant ? firstDishRestaurant : '';

  expectedDeliveryTimeField.value = '';
  customerLocationField.value = '';
}

function getFirstDishCategory() {
  const cartItems = document.getElementById("cartItems");
  if (!cartItems || !cartItems.children.length) {
    return null;
  }

  const firstListItem = cartItems.firstElementChild;
  if (!firstListItem) {
    return null;
  }

  return firstListItem.dataset.dishCategory;
}

function getFirstDishRestaurant() {
  const cartItems = document.getElementById("cartItems");
  if (!cartItems || !cartItems.children.length) {
    return '';
  }

  const firstListItem = cartItems.firstElementChild;
  if (!firstListItem) {
    return '';
  }

  return firstListItem.dataset.restaurant;
}

function checkAuthenticationStatus() {
  return false; // Placeholder, replace with actual authentication check
}
function closeOrderFormModal() {
  const modal = document.getElementById("orderFormModal");
  modal.style.display = "none";
}

function placeOrder() {
  console.log('Function placeOrder called');
  const cartItems = JSON.parse(localStorage.getItem('cart')) || [];

  if (!cartItems.length) {
    alert('Your cart is empty!');
    return;
  }

  const customerName = document.getElementById("customerName").value.trim();
  const phoneNumber = document.getElementById("phoneNumber").value.trim();
  const selectedCategory = document.getElementById("selectedCategory").textContent || document.getElementById("categoryDropdown").value;
  const selectedRestaurant = document.getElementById("selectedRestaurant").textContent;
  const customerLocation = document.getElementById("customerLocation").value.trim();
  const expectedDeliveryTime = document.getElementById("expectedDeliveryTime").value.trim();

  if (!customerName || !phoneNumber || !selectedCategory || !selectedRestaurant || !customerLocation || !expectedDeliveryTime) {
    alert('Please fill in all required fields.');
    return;
  }

  console.log("Order placed!");
  console.log("Cart Items:", cartItems);

  showOrderSummaryModal(cartItems);
}

function showOrderSummaryModal(cartItems) {
  console.log("Retrieved cart items:", cartItems);
  const orderSummaryList = document.getElementById('orderSummaryList');
  const totalPriceContainer = document.getElementById('totalPriceContainer');
  orderSummaryList.innerHTML = '';
  totalPriceContainer.innerHTML = '';

  if (!cartItems || !cartItems.length) {
      console.warn('Cart items are empty or undefined.');
      return;
  }

  cartItems.forEach(item => {
      const listItem = document.createElement('div');
      listItem.classList.add('order-summary-item');

      const subtotal = (item.dishPrice * 1.2) * item.quantity;
      listItem.innerHTML = `
          <div class="item-details">
              <span>${item.dishName} - Kes.${(item.dishPrice * 1.2).toFixed(2)} @each x ${item.quantity}</span>
              <span>Kes.${subtotal.toFixed(2)}</span>
          </div>
          <div class="item-actions">
              <button class="btn btn-sm btn-outline-secondary decrease-qty">-</button>
              <span class="quantity">${item.quantity}</span>
              <button class="btn btn-sm btn-outline-secondary increase-qty">+</button>
              <button class="btn btn-sm btn-outline-danger delete-dish">Delete</button>
          </div>
      `;
      orderSummaryList.appendChild(listItem);

      listItem.querySelector('.decrease-qty').addEventListener('click', () => decreaseQty(item));
      listItem.querySelector('.increase-qty').addEventListener('click', () => increaseQty(item));
      listItem.querySelector('.delete-dish').addEventListener('click', () => deleteDish(item));
  });

  // Calculate the total price
  const totalPrice = cartItems.reduce((acc, item) => acc + ((item.dishPrice * 1.2) * item.quantity), 0);

  // Display the total price
  totalPriceContainer.innerHTML = `Total Price: Kes.${totalPrice.toFixed(2)}`;

  $('#orderSummaryModal').modal('show');
}

function confirmOrder() {
  const customerName = document.getElementById('customerName').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const location = document.getElementById('customerLocation').value.trim();
    const expectedTime = document.getElementById('expectedDeliveryTime').value.trim();
    if (!customerName || !phoneNumber || !location || !expectedTime) {
      alert('Please fill in all required fields.');
      return;
    }
  
  showPaymentSummary();
  //clearCart();
  closeOrderSummaryModal();
  updateUI();
}
 

function closeOrderSummaryModal() {
  $('#orderSummaryModal').modal('hide');
}

function decreaseQty(item) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const index = cart.findIndex(cartItem => cartItem.dishCode === item.dishCode);

  if (index !== -1 && cart[index].quantity > 1) {
      cart[index].quantity--;
      localStorage.setItem('cart', JSON.stringify(cart));
  } else if (index !== -1) {
      cart.splice(index, 1);
      localStorage.setItem('cart', JSON.stringify(cart));
  }
  updateUI();
}

function increaseQty(item) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const index = cart.findIndex(cartItem => cartItem.dishCode === item.dishCode);

  if (index !== -1) {
      cart[index].quantity++;
      localStorage.setItem('cart', JSON.stringify(cart));
  }
  updateUI();
}

function deleteDish(item) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const index = cart.findIndex(cartItem => cartItem.dishCode === item.dishCode);

  if (index !== -1) {
      cart.splice(index, 1);
      localStorage.setItem('cart', JSON.stringify(cart));
  }
  updateUI();
}

function updateUI() {
  console.log('updateUI called');
  const orderSummaryList = document.getElementById('orderSummaryList');
  const totalPriceContainer = document.getElementById('totalPriceContainer');
  if (!orderSummaryList) {
      console.error('Element #orderSummaryList not found.');
      return;
  }
  const cartItems = JSON.parse(localStorage.getItem('cart')) || [];

  orderSummaryList.innerHTML = '';
  if (cartItems.length === 0) {
    totalPriceContainer.innerHTML = 'Total Price: Kes.0.00';
    return;
  }
      console.log('No items in the cart');
  // } else {
  //     console.log('Updating UI with cart items:', cartItems);
  // }

  cartItems.forEach(item => {
      const listItem = document.createElement('div');
      listItem.classList.add('order-summary-item');

      const subtotal = (item.dishPrice * 1.2) * item.quantity;
      listItem.innerHTML = `
          <div class="item-details">
              <span class="item-info">${item.dishName} - Kes.${(item.dishPrice * 1.2).toFixed(2)} @each x <span class="item-quantity">${item.quantity}</span></span>
              <span class="item-subtotal">Kes.${subtotal.toFixed(2)}</span>
          </div>
          <div class="item-actions">
              <button class="btn btn-sm btn-outline-secondary decrease-qty">-</button>
              <span class="quantity">${item.quantity}</span>
              <button class="btn btn-sm btn-outline-secondary increase-qty">+</button>
              <button class="btn btn-sm btn-outline-danger delete-dish">Delete</button>
          </div>
      `;
      orderSummaryList.appendChild(listItem);

      listItem.querySelector('.decrease-qty').addEventListener('click', () => decreaseQty(item));
      listItem.querySelector('.increase-qty').addEventListener('click', () => increaseQty(item));
      listItem.querySelector('.delete-dish').addEventListener('click', () => deleteDish(item));
  });

  updateTotalPrice(cartItems);

  $('#orderSummaryModal').modal('show');
}

function updateTotalPrice(cartItems) {
  const totalPrice = cartItems.reduce((acc, item) => acc + ((item.dishPrice * 1.2) * item.quantity), 0);
  const totalPriceContainer = document.getElementById('totalPriceContainer');
  totalPriceContainer.innerHTML = `Total Price: Kes.${totalPrice.toFixed(2)}`;    
} 

function showOrderSummaryModal(cartItems) {
  localStorage.setItem('cart', JSON.stringify(cartItems));
  updateUI();
}


function showPaymentSummary() {
  const customerName = document.getElementById("customerName").value.trim();
  const phoneNumber = document.getElementById("phoneNumber").value.trim();
  const customerLocation = document.getElementById("customerLocation").value.trim();
  const expectedDeliveryTime = document.getElementById("expectedDeliveryTime").value.trim();
  const cartItems = JSON.parse(localStorage.getItem('cart')) || [];

  if (!cartItems.length) {
    console.warn('Cart is empty.');
    return;
  }

  const firstDishRestaurant = cartItems[0].restaurant; // Get the restaurant name from the first item

  getRestaurantCoordinates(firstDishRestaurant, function(restaurantLocation) {
    if (!restaurantLocation) {
      alert('Unable to get restaurant location.');
      return;
    }

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: customerLocation }, function(results, status) {
      if (status === "OK") {
        const customerCoordinates = results[0].geometry.location;
        const distance = calculateDistance(
          restaurantLocation.lat(),
          restaurantLocation.lng(),
          customerCoordinates.lat(),
          customerCoordinates.lng()
        );

        let deliveryCharges = 0;
        if (distance < 2) {
          deliveryCharges = 50;
        } else {
          deliveryCharges = Math.round(distance * 50);
        }

        const totalPrice = cartItems.reduce((total, item) => total + item.quantity * (item.dishPrice * 1.2), 0);
        const grandTotal = Math.round(totalPrice + deliveryCharges);

        const paymentSummaryDetails = document.getElementById("paymentSummaryDetails");
        paymentSummaryDetails.innerHTML = `
          <p><strong>Customer Name:</strong> ${customerName}</p>
          <p><strong>Phone Number:</strong> ${phoneNumber}</p>
          <p><strong>Location:</strong> ${customerLocation}</p>
          <p><strong>Expected Delivery Time:</strong> ${expectedDeliveryTime}</p>
          <h3>Order Details:</h3>
          <ul class="list-group mb-3">
            ${cartItems.map(item => `
              <li class="list-group-item d-flex justify-content-between align-items-center">
                ${item.dishName} - ${item.quantity} x Kes.${(item.dishPrice * 1.2).toFixed(2)}
                <span>Kes.${(item.quantity * (item.dishPrice * 1.2)).toFixed(2)}</span>
              </li>
            `).join('')}
          </ul>
          <p class="text-end"><strong>Total Price:</strong> Kes.${totalPrice.toFixed(2)}</p>
          <p class="text-end"><strong>Delivery Charges (${distance.toFixed(2)} km):</strong> Kes.${deliveryCharges.toFixed(2)}</p>
          <p class="text-end"><strong>Grand Total:</strong> Kes.${grandTotal}</p>
        `;

        const paymentModal = new bootstrap.Modal(document.getElementById('paymentSummaryModal'));
        paymentModal.show();
        // Update order details with delivery charges
        const orderDetails = {
          customerName: customerName,
          phoneNumber: phoneNumber,
          customerLocation: customerLocation,
          expectedDeliveryTime: expectedDeliveryTime,
          dishes: cartItems,
          deliveryCharges: deliveryCharges,
          totalPrice: grandTotal // Include grand total including delivery charges
        };

        // Store orderDetails in localStorage or pass to the next step
        localStorage.setItem('orderDetails', JSON.stringify(orderDetails));
      } else {
        console.error("Geocode was not successful for the following reason: " + status);
        alert('Unable to get customer location.');
      }
    });
  });
}
function payNow() {
  alert('Redirecting to payment gateway...');
   // Display payment options modal
   $('#paymentOptionsModal').modal('show');
  
  console.log('Function payNow called');
  //clearCart();
  //firstDishRestaurant = '';

}
// Function to open options modal
function openOptionsModal() {
  // Close payment summary modal
  $('#paymentSummaryModal').modal('hide');
  
  // Open options modal
  $('#paymentOptionsModal').modal('show');
}

// Example event listener or function where you trigger the options modal
document.getElementById('paymentOptionsModal').addEventListener('click', paymentOptionsModal);
//calculate total price
function calculateTotalPrice() {
  const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
  let totalPrice = 0;

  cartItems.forEach(item => {
    totalPrice += (item.dishPrice * 1.2) * item.quantity;   
  }); 

  return totalPrice;
}

// Function to handle payment process
async function processPayment(method) {
  switch (method) {
    case 'paypal':
      console.log('Processing PayPal payment...');
      break;
    case 'visa':
      console.log('Processing Visa Card payment...');
      break;
    case 'mpesa':
      console.log('Processing M-Pesa payment...');
      try {
        const totalPrice = calculateTotalPrice(); 

        // Calculate delivery charges
        const customerLocation = document.getElementById("customerLocation").value.trim();
        const deliveryCharges = await calculateDeliveryCharges(customerLocation);

        // Calculate the total amount to be paid
        const finalAmount = Math.round(totalPrice + deliveryCharges);

 
         // Prompt for M-Pesa phone number with placeholder
         const paymentPhoneNumber = prompt('Enter your M-Pesa phone number (format: 254712345678):', '254');
 
         // Validate phone number
         if (!paymentPhoneNumber || !/^254\d{9}$/.test(paymentPhoneNumber)) {
           alert('Please enter a valid phone number in the format 254712345678.');
           return;
         }
    
        // Prompt for the amount with total price pre-filled
        const amount = prompt('Enter the amount to pay:', finalAmount);

 
         if (isNaN(amount) || amount <= 0) {
           alert('Please enter a valid amount.');
           return;
         }
          // Initiate M-Pesa payment
        const response = await initiateMpesaPayment(paymentPhoneNumber, amount);
        if (response && response.ResponseCode === '0') {
          // Display success message
          alert('Payment successful! Your order will be processed and dispatched as soon as possible. Thank you');
           
          // Close the modal and show thank you message
          $('#paymentOptionsModal').modal('hide');
          // alert('Thank you! Your order will be processed and dispatched as soon as possible.');

            // Dynamically retrieve order details from the relevant elements
            const orderId = 'ORD123456'; // You might want to generate this dynamically
            const customerName = document.getElementById('customerName').value;
            const phoneNumber = document.getElementById('phoneNumber').value;
            const selectedCategory = document.getElementById('selectedCategory').innerText;
            const selectedRestaurant = document.getElementById('selectedRestaurant').innerText;
            const customerLocation = document.getElementById('customerLocation').value;
            const expectedDeliveryTime = document.getElementById('expectedDeliveryTime').value;
            const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
  
            console.log('Cart items:', cartItems);
          // Handle empty cart case
          if (cartItems.length === 0) {
            alert('Your cart is empty. Please add items to your cart before proceeding with the payment.');
            return;
          }

          // Validate cart items and construct dishes array
          const dishes = cartItems.map(item => {
            // Debug: Log each item
            console.log('Cart item:', item);

            if (!item.dishCode || !item.dishName || !item.quantity || !item.dishPrice) {
              console.error('Invalid item detected:', item);
              throw new Error('Invalid cart item detected. Please ensure all items in your cart are valid.');
            }

            return {
              dishCode: item.dishCode,
              dishName: item.dishName,
              quantity: item.quantity,
              price: item.dishPrice * 1.2
            };
          });

          const currentUser = await getCurrentUser();

          console.log('Current user ID:', currentUser._id);

            const orderDetails = {
              orderId: orderId,
              customerName: customerName,
              phoneNumber: phoneNumber,
              selectedCategory: selectedCategory,
              selectedRestaurant: selectedRestaurant, 
              customerLocation: customerLocation,
              expectedDeliveryTime: expectedDeliveryTime,
              dishes: dishes,
              deliveryCharges: deliveryCharges,
              totalPrice: amount,
              userId: currentUser._id
            };
  
          // Save order to the database
          await saveOrderToDatabase(orderDetails); 

          // Optionally, clear the cart
          clearCart();

          // Redirect to the home page after a delay
          setTimeout(() => {
            window.location.href = 'index.html'; // Adjust the URL to your home page
          }, 2000);
        } else {
          // Handle payment failure
          alert('Payment failed. Please try again.');
          handlePaymentFailure();
        }
      } catch (error) {
        console.error('M-Pesa payment error:', error);
        alert('Error initiating M-Pesa payment. Please try again.');
        handlePaymentFailure();
      }
      break;
    case 'airtel':
      console.log('Processing Airtel Money payment...');
      try {
        await handleAirtelPayment();
      } catch (error) {
        console.error('Airtel payment error:', error);
        alert('Error initiating Airtel payment. Please try again.');
        handlePaymentFailure();
      }
      break;
    default:
      console.error('Unsupported payment method.');
      return;
  }
}
// Function to calculate delivery charges based on customer location
async function calculateDeliveryCharges(customerLocation) {
  return new Promise((resolve, reject) => {
    getRestaurantCoordinates(firstDishRestaurant, function(restaurantLocation) {
      if (!restaurantLocation) {
        reject(new Error('Unable to get restaurant location.'));
      }

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: customerLocation }, function(results, status) {
        if (status === "OK") {
          const customerCoordinates = results[0].geometry.location;
          const distance = calculateDistance(
            restaurantLocation.lat(),
            restaurantLocation.lng(),
            customerCoordinates.lat(),
            customerCoordinates.lng()
          );

          let deliveryCharges = 0;
          if (distance < 2) {
            deliveryCharges = 50;
          } else {
            deliveryCharges = distance * 50;
          }

          resolve(deliveryCharges);
        } else {
          reject(new Error('Geocode was not successful for the following reason: ' + status));
        }
      });
    });
  });
}
function handlePaymentFailure() {
    const retry = confirm('Payment transfer failed! Would you like to try again?');
  
    if (retry) {
      payWithMpesa();
    } else {
      const saveForLater = confirm('Would you like to save the order for later?');
  
      if (saveForLater) {
        alert('Your order has been saved for later.');
        // Save order for later logic here
        saveOrderForLater();
      } else {
        alert('Order has been canceled.');
        clearCart
        // Close modal and return to home page
        $('#paymentOptionsModal').modal('hide');
        setTimeout(() => {
          window.location.href = 'home.html'; // Adjust the URL to your home page
        }, 2000);
      }
    }
  }

  function saveOrderForLater() {
    const orderDetails = getOrderDetails();
    localStorage.setItem('savedOrder', JSON.stringify(orderDetails));
  }
  
  function getOrderDetails() {
    const customerName = document.getElementById('customerName').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const selectedCategory = document.getElementById('selectedCategory').innerText;
    const selectedRestaurant = document.getElementById('selectedRestaurant').innerText;
    const customerLocation = document.getElementById('customerLocation').value;
    const expectedDeliveryTime = document.getElementById('expectedDeliveryTime').value;
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
   
    return {
      customerName,
      phoneNumber,
      selectedCategory,
      selectedRestaurant,
      customerLocation,
      expectedDeliveryTime,
      cartItems
    };
  }
  
function payWithMpesa() {
  const phoneNumber = prompt('Enter your M-Pesa phone number:');
  const amount = prompt('Enter the amount to pay:');
  initiateMpesaPayment(phoneNumber, amount)
    .then(response => {
      if (response && response.ResponseCode === '0') {
        alert('Payment initiated. Check your phone for M-Pesa prompt.');
      } else {
        handlePaymentFailure();
      }
    })
    .catch(error => {
      console.error('M-Pesa payment error:', error);
      handlePaymentFailure();
    });
}


const shortcode = '174379';
const passkey = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
console.log('Axios:', axios); 

async function initiateMpesaPayment(phoneNumber, amount) {
  try {
    const response = await axios.post('http://localhost:3000/api/mpesa/pay', {
      phoneNumber,
      amount
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      const data = response.data;
      console.log('Payment Response:', data);
      if (data.ResponseCode === '0') {
        alert(data.CustomerMessage);
        return data; // Return the data for further processing
      } else {
        console.error('Payment failed:', data.ResponseDescription);
        alert('Payment failed. Please try again.');
        return null;
      }
    } else {
      console.error('Failed to initiate payment:', response.statusText);
      alert('Error initiating M-Pesa payment. Please try again.');
      return null;
    }
  } catch (error) {
    console.error('Error initiating M-Pesa payment:', error);
    alert('Error initiating M-Pesa payment. Please try again.');
    return null;
  }
}

async function sendReceipt(phoneNumber, amount) {
  const response = await fetch('http://localhost:3000/api/send-receipt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ phoneNumber, amount })
  });
  return await response.json();
}

// async function saveOrderToDatabase(orderDetails) {
//   const response = await fetch('http://localhost:3000/api/paidOrder', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
      
//     },
//     body: JSON.stringify(orderDetails)
//   });
//   return await response.json();
// }
async function saveOrderToDatabase(orderDetails) {
  try {
    const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage
    const response = await fetch('http://localhost:3000/api/paidOrder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        //'Authorization': `Bearer ${token}` // Pass the token for authentication
      },
      body: JSON.stringify(orderDetails)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Order saved successfully:', data);
    } else {
      const error = await response.json();
      console.error('Error saving order:', error);
      alert('Error saving order: ' + error.message);
    }
  } catch (error) {
    console.error('Error saving order:', error);
    alert('Error saving order. Please try again.');
  }
}
function clearCart() {
  const cartItemsElement = document.getElementById('cartItems');
  const totalPriceElement = document.getElementById('totalPrice');
  const cartCountElement = document.getElementById('cartCount');

  while (cartItemsElement.firstChild) {
    cartItemsElement.removeChild(cartItemsElement.firstChild);
  }

  totalPriceElement.textContent = '0.00';
  cartCountElement.textContent = '0';

  localStorage.removeItem('cart');
  firstDishRestaurant = ''; // Reset the firstDishRestaurant variable
}


// AIRTEL PAYMENT OPTION

// async function handleAirtelPayment() {
//   try {
//     // Retrieve total price from cart
//     const totalPriceElement = document.getElementById("totalPrice");
//     const totalPrice = totalPriceElement ? Math.round(totalPriceElement.textContent) : 0;

//     // Prompt for Airtel phone number with placeholder
//     const paymentPhoneNumber = prompt('Enter your Airtel phone number (format: 254712345678):', '254');

//     // Validate phone number
//     if (!paymentPhoneNumber || !/^254\d{9}$/.test(paymentPhoneNumber)) {
//       alert('Please enter a valid phone number in the format 254712345678.');
//       return;
//     }

//     // Calculate delivery charges
//     const customerLocation = document.getElementById("customerLocation").value.trim();
//     const deliveryCharges = await calculateDeliveryCharges(customerLocation);

//     // Prompt for the amount with total price pre-filled
//     const amount = prompt('Enter the amount to pay:', Math.round(totalPrice + deliveryCharges));

//     if (isNaN(amount) || amount <= 0) {
//       alert('Please enter a valid amount.');
//       return;
//     }

//     // Initiate Airtel payment
//     const response = await initiateAirtelPayment(paymentPhoneNumber, amount);
//     if (response && response.ResponseCode === '0') {
//       // Display success message
//       alert('Payment successful! Your order will be processed and dispatched as soon as possible. Thank you.');
       
//       // Close the modal and show thank you message
//       $('#paymentOptionsModal').modal('hide');
//       // alert('Thank you! Your order will be processed and dispatched as soon as possible.');

//         // Dynamically retrieve order details from the relevant elements
//         const orderId = 'ORD123456'; // You might want to generate this dynamically
//         const customerName = document.getElementById('customerName').value;
//         const phoneNumber = document.getElementById('phoneNumber').value;
//         const selectedCategory = document.getElementById('selectedCategory').innerText;
//         const selectedRestaurant = document.getElementById('selectedRestaurant').innerText;
//         const customerLocation = document.getElementById('customerLocation').value;
//         const expectedDeliveryTime = document.getElementById('expectedDeliveryTime').value;
//         const cartItems = JSON.parse(localStorage.getItem('cart')) || [];

//         console.log('Cart items:', cartItems);
//       // Handle empty cart case
//       if (cartItems.length === 0) {
//         alert('Your cart is empty. Please add items to your cart before proceeding with the payment.');
//         return;
//       }

//       // Validate cart items and construct dishes array 
//       const dishes = cartItems.map(item => {
//         // Debug: Log each item
//         console.log('Cart item:', item);

//         if (!item.dishCode || !item.dishName || !item.quantity || !item.dishPrice) {
//           console.error('Invalid item detected:', item);
//           throw new Error('Invalid cart item detected. Please ensure all items in your cart are valid.');
//         }

//         return {
//           dishCode: item.dishCode,
//           dishName: item.dishName,
//           quantity: item.quantity,
//           price: item.dishPrice * 1.2
//         };
//       });

//        // Retrieve the current user ID
//        const currentUser = await getCurrentUser();

//         const orderDetails = {
//           orderId: orderId,
//           customerName: customerName,
//           phoneNumber: phoneNumber,
//           selectedCategory: selectedCategory,
//           selectedRestaurant: selectedRestaurant, 
//           customerLocation: customerLocation,
//           expectedDeliveryTime: expectedDeliveryTime,
//           dishes: dishes,
//           deliveryCharges: deliveryCharges,
//           totalPrice: amount,
//           userId: currentUser._id
//         };

//       // Save order to the database
//       await saveOrderToDatabase(orderDetails); 

//       // Optionally, clear the cart
//       clearCart();

//       // Redirect to the home page after a delay
//       setTimeout(() => {
//         window.location.href = 'index.html'; // Adjust the URL to your home page
//       }, 2000);
//     } else {
//       // Handle payment failure
//       alert('Payment failed. Please try again.');
//       handlePaymentFailure();
//     }
//   } catch (error) {
//     console.error('Airtel payment error:', error);
//     alert('Error initiating Airtel payment. Please try again.');
//     handlePaymentFailure();
//   }
// }

// async function initiateAirtelPayment(phoneNumber, amount) {
//   try {
//     const response = await axios.post('http://localhost:3000/api/airtel/pay', {
//       phoneNumber,
//       amount
//     }, {
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     });

//     if (response.status === 200) {
//       const data = response.data;
//       console.log('Payment Response:', data);
//       if (data.ResponseCode === '0') {
//         alert(data.CustomerMessage);
//         return data; // Return the data for further processing
//       } else {
//         console.error('Payment failed:', data.ResponseDescription);
//         alert('Payment failed. Please try again.');
//         return null;
//       }
//     } else {
//       console.error('Failed to initiate payment:', response.statusText);
//       alert('Error initiating Airtel payment. Please try again.');
//       return null;
//     }
//   } catch (error) {
//     console.error('Error initiating Airtel payment:', error);
//     alert('Error initiating Airtel payment. Please try again.');
//     return null;
//   }
// }
