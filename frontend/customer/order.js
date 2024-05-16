//restaurant selection
const categoryDropdown = document.getElementById("categoryDropdown");
categoryDropdown.addEventListener("change", (event) => {
  const selectedCategory = event.target.value;

  if (selectedCategory === "specialOrders") {
    // Code to handle special orders (optional)
  } else {
    fetchRestaurants(selectedCategory);
  }
});
function updateSelectedCategory(categoryName) {
  document.getElementById("selectedCategory").textContent = categoryName;
}
console.log(document.getElementById("selectedCategory").textContent);
async function fetchRestaurants(cuisineType) {
  // Prevent duplicate entries
  const restaurantListDiv = document.getElementById("restaurantList");
  const existingRestaurants = Array.from(restaurantListDiv.children).map((el) =>
    el.textContent.trim()
  );

  // Fetch restaurants from the backend
  await fetch(`http://localhost:3000/api/restaurants/${cuisineType}`)
    .then((response) => {
      if (!response.ok) {
        // Check if the response was successful
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      // Filter out restaurants that have already been listed
      const uniqueRestaurants = [
        ...new Set(data.map((restaurant) => restaurant.trim().toLowerCase())),
      ]; // Trim and lowercase names

      console.log(uniqueRestaurants); // Verify unique entries

      restaurantListDiv.innerHTML = ""; // Clear existing content

      uniqueRestaurants.forEach((restaurant) => {
        const listItem = document.createElement("p");
        listItem.textContent = capitalizeEachWord(restaurant);
        listItem.addEventListener("click", () =>
          fetchDishesForRestaurant(restaurant)
        ); // New event listener
        restaurantListDiv.appendChild(listItem);
      });
      // After displaying the restaurants, add an event listener to the restaurant list items
      restaurantListDiv.addEventListener("click", (event) => {
        if (event.target.tagName === "P") {
          // Check if the clicked element is a paragraph (list item)
          const selectedRestaurant = event.target.textContent.trim();
          document.getElementById("selectedRestaurant").textContent =
            selectedRestaurant;
          fetchDishesForRestaurant(selectedRestaurant);
        }
      });

      const restaurantDropdown = document.getElementById("restaurantDropdown");
      restaurantDropdown.innerHTML = ""; // Clear existing options

      uniqueRestaurants.forEach((restaurant) => {
        const option = document.createElement("option");
        option.value = restaurant; // Set the value to the restaurant name
        option.textContent = restaurant;
        restaurantDropdown.appendChild(option);
      });

      restaurantDropdown.addEventListener("change", (event) => {
        const selectedRestaurant = event.target.value;
        fetchDishesForRestaurant(selectedRestaurant);
      });
    })
    .catch((error) => console.error("Error fetching restaurants:", error));
}
// Function to capitalize the first letter of each word
function capitalizeEachWord(str) {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
function handleCuisineClick(cuisineType) {
  updateSelectedCategory(cuisineType);
  fetchRestaurants(cuisineType);
}
//fetching dishes for particular restaurant
async function fetchDishesForRestaurant(restaurantName) {
  const lowerCaseRestaurantName = restaurantName.toLowerCase(); // Convert to lowercase
  try {
    const response = await fetch(
      `http://localhost:3000/api/restaurantDishes?restaurant=${restaurantName}`
    );
    const responseData = await response.json();
    console.log(responseData);
    // Check for valid data format
    if (!Array.isArray(responseData.dishes)) {
      throw new Error("Invalid data format: Expected an array of dishes");
    }

    const dishes = responseData.dishes;

    // Clear the dishes container before displaying new dishes
    const dishesContainer = document.getElementById("dishesContainer");
    dishesContainer.innerHTML = ""; // Clear existing dishes

    // Process and display dishes for the selected restaurant
    dishes.forEach((dish) => {
      const dishDiv = document.createElement("div");
      dishDiv.classList.add("dish");

      // Display dish details
      const dishName = document.createElement("h4");
      dishName.textContent = dish.dishName;
      dishDiv.appendChild(dishName);

      const price = document.createElement("p");
      price.textContent = `Price: Kes.${(dish.dishPrice * 1.2).toFixed(2)}`;
      dishDiv.appendChild(price);

      const description = document.createElement("p");
      description.textContent = dish.dishDescription;
      dishDiv.appendChild(description);

      // Add to cart button
      const addToCartButton = document.createElement("button");
      addToCartButton.textContent = "Add to Cart";
      addToCartButton.addEventListener("click", () => addToCart(dish));
      dishDiv.appendChild(addToCartButton);

      dishesContainer.appendChild(dishDiv);
    });
    // Process dishes for dropdown menu (optional)
    const dishDropdown = document.getElementById("dishDropdown");
    dishDropdown.innerHTML = ""; // Clear existing options (optional)
    dishes.forEach((dish) => {
      const option = document.createElement("option");
      // ... your existing code to create and populate dropdown options
      option.value = dish.dishCode;
      option.textContent = `${dish.dishName} - Kes. ${(
        dish.dishPrice * 1.2
      ).toFixed(2)}`;
      dishDropdown.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching dishes:", error);
  }
}

//working on displaying all dishes
async function fetchDishes() {
  try {
    const response = await fetch("http://localhost:3000/api/dishes");
    const responseData = await response.json();

    // Check for valid data format
    if (!Array.isArray(responseData.dishes)) {
      throw new Error("Invalid data format: Expected an array of dishes");
    }

    const dishes = responseData.dishes;

    // Process dishes for display
    const dishesContainer = document.getElementById("dishesContainer");
    dishes.forEach((dish) => {
      // ... your existing code to create and display dish details
      const dishDiv = document.createElement("div");
      dishDiv.classList.add("dish");

      // Display dish details
      const dishName = document.createElement("h4");
      dishName.textContent = dish.dishName;
      dishDiv.appendChild(dishName);

      const price = document.createElement("p");
      price.textContent = `Price: Kes.${(dish.dishPrice * 1.2).toFixed(2)}`;
      dishDiv.appendChild(price);

      const description = document.createElement("p");
      description.textContent = dish.dishDescription;
      dishDiv.appendChild(description);

      // Add to cart button
      const addToCartButton = document.createElement("button");
      addToCartButton.textContent = "Add to Cart";
      addToCartButton.addEventListener("click", () => addToCart(dish));
      dishDiv.appendChild(addToCartButton);

      dishesContainer.appendChild(dishDiv);
    });
    // Process dishes for dropdown menu
    const dishDropdown = document.getElementById("dishDropdown");
    dishes.forEach((dish) => {
      const option = document.createElement("option");
      // ... your existing code to create and populate dropdown options
      option.value = dish.dishCode;
      option.textContent = `${dish.dishName} - Kes. ${(
        dish.dishPrice * 1.2
      ).toFixed(2)}`;
      dishDropdown.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching dishes:", error);
  }
}

// Fetch dishes when page loads
window.onload = fetchDishes;

// Add selected dish to cart
function addToCart(dishDetails) {
  // Check if dishDetails is an object (from displayed list button)
  if (typeof dishDetails === "object") {
    const dishName = dishDetails.dishName;
    const price = dishDetails.dishPrice * 1.2; // Assuming you want to add a 20% markup
    const quantity = 1; // Assuming quantity is always 1 for displayed list buttons

    // ... rest of your code to add dish to cart with these details
    const cartItems = document.getElementById("cartItems");
    const listItem = document.createElement("li");

    // Calculate subtotal
    const subtotal = price * quantity;

    listItem.textContent = `${dishName} - Kes.${subtotal.toFixed(
      2
    )} x ${quantity} = ${subtotal}`;
    cartItems.appendChild(listItem);

    // Update total price (if applicable)
    const totalPriceElement = document.getElementById("totalPrice");
    if (totalPriceElement) {
      const totalPrice = parseFloat(totalPriceElement.textContent);
      totalPriceElement.textContent = (totalPrice + subtotal).toFixed(2);
    }
  } else {
    const dishDropdown = document.getElementById("dishDropdown");
    const selectedDish = dishDropdown.options[dishDropdown.selectedIndex];
    const quantity = document.getElementById("quantity").value;
    const cartItems = document.getElementById("cartItems");
    const listItem = document.createElement("li");

    // Calculate subtotal
    const dishPrice = parseFloat(selectedDish.textContent.split("Kes.")[1]);
    const subtotal = dishPrice * quantity;

    listItem.textContent = `${selectedDish.textContent} x ${quantity} = ${subtotal}`;
    cartItems.appendChild(listItem);

    // Update total price
    const totalPrice = parseFloat(
      document.getElementById("totalPrice").textContent
    );
    document.getElementById("totalPrice").textContent = (
      totalPrice + subtotal
    ).toFixed(2);
    // Include selectedCategory and selectedRestaurant in the cart item
    listItem.dataset.category = selectedCategory;
    listItem.dataset.restaurant = selectedRestaurant;
  }
}

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

// placing the order using place order

function placeOrder() {
  showOrderSummary();
  // Determine the selection type for category and restaurant
  const categorySelectionType = document.getElementById("categoryDropdown")
    ? "dropdown"
    : "list";
  const restaurantSelectionType = document.getElementById("restaurantDropdown")
    ? "dropdown"
    : "list";

  // Retrieve selected category and restaurant based on the selection type
  let selectedCategory, selectedRestaurant;
  if (categorySelectionType === "dropdown") {
    selectedCategory = document.getElementById("categoryDropdown").value;
  } else {
    selectedCategory = document.getElementById("selectedCategory").textContent;
  }

  if (restaurantSelectionType === "dropdown") {
    selectedRestaurant = document.getElementById("restaurantDropdown").value;
  } else {
    selectedRestaurant =
      document.getElementById("selectedRestaurant").textContent;
  }

  // Ensure these values are not empty
  if (!selectedCategory || !selectedRestaurant) {
    alert("Please select a category and restaurant.");
    return;
  }

  console.log(
    "Retrieving Selected Category:",
    document.getElementById("selectedCategory").textContent
  );

  // Wait for the user to confirm the order
  const confirmButton = document.getElementById("confirmOrderButton");
  confirmButton.addEventListener("click", function () {
    // Get form inputs
    const customerName = document.getElementById("customerName").value;
    const phoneNumber = document.getElementById("phoneNumber").value;
    selectedCategory;
    selectedRestaurant;
    const customerLocation = document.getElementById("customerLocation").value;
    const expectedDeliveryTime = document.getElementById(
      "expectedDeliveryTime"
    ).value;

    // Check if all required fields are filled
    if (
      !customerName ||
      !phoneNumber ||
      !selectedCategory ||
      !selectedRestaurant ||
      !customerLocation ||
      !expectedDeliveryTime
    ) {
      alert("Please fill in all required fields.");
      // return
    }

    // Get the list of ordered dishes from the cart

    const cartItems = document
      .getElementById("cartItems")
      .getElementsByTagName("li");

    const orderedDishes = Array.from(cartItems).map((item) => {
      const parts = item.textContent.split(" x ");
      const dishNameAndPrice = parts[0]; // Dish Name and Price are in the first part
      const quantity = parseInt(parts[1]);
      const dishName = dishNameAndPrice.split(" - ")[0];
      // Function to extract the full price (improved for error handling and clarity)
      function extract_full_price(dishNameAndPrice) {
        try {
          const parts = dishNameAndPrice.split(" - ");
          if (parts.length !== 2) {
            console.warn(`Invalid format for dish: ${dishNameAndPrice}`);
            return null;
          }

          // Handle potential variations in price string format:
          const priceStr = parts[1].trim(); // Remove leading/trailing whitespace

          // Use a regular expression to extract the number after the currency symbol (Kes.)
          const regex = /(?:\D+)?(\d+(?:\.\d+)?)/; // Capture optional non-digits followed by number (with optional decimals)
          const match = regex.exec(priceStr);

          if (!match) {
            console.warn(`Failed to parse price for dish: ${dishNameAndPrice}`);
            return null;
          }

          const price = parseFloat(match[1]);
          return price;
        } catch (error) {
          console.error(
            `Error extracting price for dish: ${dishNameAndPrice}`,
            error
          );
          return null;
        }
      }

      // Call the extract_full_price function to get the full price
      const price = extract_full_price(dishNameAndPrice);

      const dishCode = dishName.split(" - ")[0];
      return { dishCode, dishName, quantity, price };
    });

    // Calculate total price
    let totalPrice = 0;
    orderedDishes.forEach((dish) => {
      totalPrice += dish.price * dish.quantity;
    });

    // Create the order object
    const orderData = {
      customerName,
      phoneNumber,
      selectedCategory:
        document.getElementById("selectedCategory").textContent ||
        document.getElementById("categoryDropdown").value,
      selectedRestaurant,
      customerLocation,
      expectedDeliveryTime,
      dishes: orderedDishes,
      totalPrice,
    };
    console.log(orderData); // Log the orderData object to verify its contents

    // Send the order data to the server
    fetch("http://localhost:3000/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        alert("Order placed successfully!");
        // Clear the form after successful submission
        document.getElementById("customerName").value = "";
        document.getElementById("phoneNumber").value = "";
        document.getElementById("customerLocation").value = "";
        document.getElementById("expectedDeliveryTime").value = ""; // Reset time input field
        document.getElementById("totalPrice").textContent = "0";
        document.getElementById("cartItems").innerHTML = "";
      })
      .catch((error) => {
        console.error("Error:", error);
        alert(
          "Please check you order form and fill your details and place you order again."
        );
      });
  });
}

// confirmation of order
function showOrderSummary() {
  // Get order details
  const customerName = document.getElementById("customerName").value;
  const phoneNumber = document.getElementById("phoneNumber").value;
  const expectedDeliveryTime = document.getElementById(
    "expectedDeliveryTime"
  ).value;
  const cartItems = document.getElementById("cartItems");
  const totalPriceElement = document.getElementById("totalPrice");
  const totalPrice = parseFloat(totalPriceElement.textContent);

  // Generate summary
  const summary = `
    <h3>Order Summary</h3>
    <p>Name: ${customerName}</p>
    <p>Phone Number: ${phoneNumber}</p>
    <p>Expected Delivery Time: ${expectedDeliveryTime}</p>
    <p>Total Price: Kes. ${totalPrice.toFixed(2)}</p>
    <p>Dishes:</p>
    <ul>${cartItems.innerHTML}</ul>
    <button id="confirmOrderButton">Confirm Order</button>
  `;

  // Display summary in a modal or dedicated section
  const modal = document.getElementById("orderSummaryModal");
  modal.innerHTML = summary;
  modal.style.display = "block";
  // Add an event listener to the confirm button to close the modal
  const confirmButton = document.getElementById("confirmOrderButton");
  confirmButton.addEventListener("click", function () {
    // Close the modal
    modal.style.display = "none"; // Or toggle a class if you prefer
    // Proceed with order placement
    // Your existing order placement code goes here
  });
}
