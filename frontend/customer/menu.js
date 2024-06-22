document.addEventListener('DOMContentLoaded', () => {
  const cartLink = document.getElementById('cart2');
  const orderForm = document.getElementById('myForm');
  const cartCount = document.getElementById('cartCount');

  const popularDishesList = document.getElementById('popular-dishes'); // Define popularDishesList
  const recentSearchesList = document.getElementById('recent-searches');
  const newDishesList = document.getElementById('new-dishes');
  const allDishesList = document.getElementById('all-dishes');

  // Hide the order form initially
  orderForm.style.display = 'none';

  cartLink.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent the default link behavior
    orderForm.style.display = 'block';
  });

  // Function to create dish card
  function createDishCard(dish) {
    const card = document.createElement('li'); 
    card.classList.add('dish-card');
    card.innerHTML = ` 
      <img src="${dish.imageUrl}" alt="${dish.dishName}">
      <h5>${dish.dishName}</h5>
      <p>${dish.dishDescription}</p>
      <h5>Kes.${(dish.dishPrice * 1.2).toFixed(2)}</h5>
      <button>Add to Cart</button>
      <p>${dish.restaurant}</p>
    `;

    // Add event listener for the Add to Cart button
    const button = card.querySelector('button');
    button.addEventListener('click', () => addToCart(dish));

    return card;
  }

  // Function to fetch and display dishes
  async function fetchDishes() { 
    try {
      const response = await fetch('http://localhost:3000/api/dishes');
      
      // Check if response is OK and of JSON type
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new TypeError("Expected JSON response but got something else");
      }

      const data = await response.json();

      // Sort dishes based on your logic
      const popularDishes = sortDishesByPopularity(data.dishes);
      const recentSearches = await sortDishesByRecentSearches(data.dishes);
      const newDishes = sortDishesByNew(data.dishes);
      const allDishes = data.dishes;

      // Display dishes in their respective lists
      displayDishes(popularDishes, popularDishesList);
      displayDishes(recentSearches, recentSearchesList);
      displayDishes(newDishes, newDishesList);
      displayDishes(allDishes, allDishesList);

    } catch (error) {
      console.error(error);
      alert(`An error occurred: ${error.message}`);
    }
  }

  function displayDishes(dishes, listElement) {
    listElement.innerHTML = ''; // Clear existing content

    if (!dishes || dishes.length === 0) {
      listElement.innerHTML = '<li>No dishes found.</li>'; 
      return;
    }

    dishes.forEach(dish => listElement.appendChild(createDishCard(dish)));
  }

  // Function to get user search history
  async function getUserSearchHistory(userId) {
    try {
      const response = await fetch(`http://localhost:3000/api/userSearchHistory?userId=${userId}`);
      const searchHistory = await response.json();
      return searchHistory || [];
    } catch (error) {
      console.error(error);
      return []; // Return an empty array in case of errors
    }
  }

  function sortDishesByPopularity(dishes) {
    const popularityThreshold = 10; // Adjust threshold for popular dishes
    return dishes.filter(dish => dish.orderCount >= popularityThreshold)
                 .sort((a, b) => b.orderCount - a.orderCount)
                 .concat(dishes.filter(dish => dish.orderCount < popularityThreshold));
  }

  async function sortDishesByRecentSearches(dishes) {
    const currentUser = getCurrentUser(); // Replace with actual logic to get the current user
    const userSearchHistory = await getUserSearchHistory(currentUser._id);
    const searchedDishCodes = userSearchHistory.map(search => search.dishCode);
    const filteredDishes = dishes.filter(dish => searchedDishCodes.includes(dish.dishCode));
    return [...filteredDishes, ...dishes.filter(dish => !searchedDishCodes.includes(dish.dishCode))];
  }

  function sortDishesByNew(dishes) {
    return dishes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Mock function to get current user
  function getCurrentUser() {
    return { _id: 'userId' }; // Replace with actual logic to get the currently authenticated user
  }

  // Call fetchDishes on page load
  fetchDishes();
});


//   const popularDishesList = document.getElementById('popular-dishes');
// const recentSearchesList = document.getElementById('recent-searches');
// const newDishesList = document.getElementById('new-dishes');
// const allDishesList = document.getElementById('all-dishes');

// // Function to create and display a dish card (replace with actual HTML generation)
// function createDishCard(dish) {
//   const card = document.createElement('li');
//   card.classList.add('dish-card');
//   card.innerHTML = `
//     <img src="${dish.imageUrl}" alt="${dish.dishName}">
//     <h3>${dish.dishName}</h3>
//     <p>$${dish.dishPrice}</p>
//     <p>${dish.restaurant}</p>
//     <p>${dish.dishDescription}</p>
//   `;
//   return card;
// }

// // Function to fetch and display dishes (make API calls)
// async function fetchDishes() {
//   try {
//     const response = await fetch('http://localhost:3000/api/dishes');
//     const data = await response.json();

//     // Sort dishes based on your logic (replace with your implementation)
//     const popularDishes = sortDishesByPopularity(data.dishes);
//     const recentSearches = await sortDishesByRecentSearches(data.dishes); // Await for the async function
//     const newDishes = sortDishesByNew(data.dishes);
//     const allDishes = data.dishes;

//     // Display dishes in their respective lists
//     displayDishes(popularDishes, popularDishesList);
//     displayDishes(recentSearches, recentSearchesList);
//     displayDishes(newDishes, newDishesList);
//     displayDishes(allDishes, allDishesList);

//   } catch (error) {
//     console.error(error);
//     // Handle errors appropriately (e.g., display an error message to the user)
//   }
// }

// function displayDishes(dishes, listElement) {
//   listElement.innerHTML = ''; // Clear existing content

//   if (!dishes || dishes.length === 0) {
//     listElement.innerHTML = '<li>No dishes found.</li>'; 
//     return;
//   }

//   dishes.forEach(dish => listElement.appendChild(createDishCard(dish)));
// }

// // Your implementation for sorting dishes based on popularity, recent searches, and new dishes
// async function getUserSearchHistory(userId) {
//   try {
//     const response = await fetch(`http://localhost:3000/api/userSearchHistory?userId=${userId}`);
//     const searchHistory = await response.json();
//     return searchHistory || [];
//   } catch (error) {
//     console.error(error);
//     return []; // Return an empty array in case of errors
//   }
// }

// function sortDishesByPopularity(dishes) {
//   const popularityThreshold = 10; // Adjust threshold for popular dishes
//   return dishes.filter(dish => dish.orderCount >= popularityThreshold)
//                .sort((a, b) => b.orderCount - a.orderCount)
//                .concat(dishes.filter(dish => dish.orderCount < popularityThreshold));
// }

// async function sortDishesByRecentSearches(dishes) {
//   const currentUser = getCurrentUser(); // Replace with actual logic to get the current user
//   const userSearchHistory = await getUserSearchHistory(currentUser._id);
//   const searchedDishCodes = userSearchHistory.map(search => search.dishCode);
//   const filteredDishes = dishes.filter(dish => searchedDishCodes.includes(dish.dishCode));
//   return [...filteredDishes, ...dishes.filter(dish => !searchedDishCodes.includes(dish.dishCode))];
// }

// function sortDishesByNew(dishes) {
//   return dishes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
// }

// // Mock function to get current user
// function getCurrentUser() {
//   return { _id: 'userId' }; // Replace with actual logic to get the currently authenticated user
// }

// // Call fetchDishes on page load
// fetchDishes();

const modal = document.getElementById('orderFormModal');

// Get the button that opens the modal
const cartLink = document.getElementById("cart2");

// Get the <span> element that closes the modal
const span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
cartLink.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}