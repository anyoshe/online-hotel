document.addEventListener('DOMContentLoaded', fetchDishesAndRestaurants);

const popularDishesList = document.getElementById('popular-dishes');
const recentSearchesList = document.getElementById('recent-searches');
const newDishesList = document.getElementById('new-dishes');
const allDishesList = document.getElementById('all-dishes');
const popularRestaurantsList = document.getElementById('popular-restaurants');

async function fetchDishesAndRestaurants() {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser._id;

    if (!userId || userId === 'anonymousUserId') {
      throw new Error('Invalid user ID');
    }

    const response = await fetch('http://localhost:3000/api/dishes-and-restaurants');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    const recentSearchesDishes = await sortDishesByRecentSearches(userId, data.dishes);

    const popularDishes = sortDishesByPopularity(data.dishes);
    const newDishes = sortDishesByNew(data.dishes);
    const allDishes = data.dishes;

    displayDishes(popularDishes.slice(0, 5), popularDishesList);
    displayDishes(recentSearchesDishes, recentSearchesList);
    displayDishes(newDishes.slice(0, 5), newDishesList);
    displayDishes(allDishes, allDishesList);

    displayRestaurants(data.restaurants);
  } catch (error) {
    console.error('Error fetching data:', error);
    alert(`An error occurred: ${error.message}`);
  }
}

async function getCurrentUser() {
  const token = localStorage.getItem('token');

  if (!token) {
    console.log('No user logged in, returning default or anonymous user ID');
    return { _id: 'anonymousUserId' };
  }

  try {
    const response = await fetch('http://localhost:3000/api/auth/current', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.success) {
      console.log('Current user ID:', data.user._id);
      return { _id: data.user._id };
    } else {
      console.error('Failed to get current user:', data.message);
      return { _id: 'anonymousUserId' };
    }
  } catch (error) {
    console.error('Error:', error);
    return { _id: 'anonymousUserId' };
  }
}

async function sortDishesByRecentSearches(userId, allDishes) {
  try {
    const response = await fetch(`http://localhost:3000/api/userSearchHistory?userId=${userId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const userSearchHistory = await response.json();
    
    if (!Array.isArray(userSearchHistory.searchHistory)) {
      console.error('Expected an array for userSearchHistory.searchHistory:', userSearchHistory);
      return allDishes.sort(() => 0.5 - Math.random()).slice(0, 5);
    }

    const searchedDishCodes = userSearchHistory.searchHistory.map(search => search.dishCode);
    const filteredDishes = allDishes.filter(dish => searchedDishCodes.includes(dish.dishCode));

    if (filteredDishes.length === 0) {
      return allDishes.sort(() => 0.5 - Math.random()).slice(0, 5);
    }

    return [...filteredDishes, ...allDishes.filter(dish => !searchedDishCodes.includes(dish.dishCode))].slice(0, 5);
  } catch (error) {
    console.error('Error fetching user search history:', error);
    return allDishes.sort(() => 0.5 - Math.random()).slice(0, 5);
  }
}

function sortDishesByPopularity(dishes) {
  const allUnrated = dishes.every(dish => !dish.averageRating || dish.averageRating === 0);

  if (allUnrated) {
    return dishes
      .slice()
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
  } else {
    return dishes
      .slice()
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 5);
  }
}

function sortDishesByNew(dishes) {
  const recentDate = new Date();
  recentDate.setDate(recentDate.getDate() - 30);
  return dishes
    .filter(dish => new Date(dish.createdAt) > recentDate)
    .slice(0, 5);
}

function displayDishes(dishes, listElement) {
  listElement.innerHTML = '';

  if (!dishes || dishes.length === 0) {
    listElement.innerHTML = '<li>No dishes found.</li>';
    return;
  }

  dishes.forEach(dish => {
    const dishCard = createDishCard(dish);
    listElement.appendChild(dishCard);
  });

  if (dishes.length < 5) {
    const remainingCount = 5 - dishes.length;
    fetchAdditionalDishes(remainingCount, listElement);
  }
}

async function fetchAdditionalDishes(count, listElement) {
  try {
    const response = await fetch('http://localhost:3000/api/dishes?limit=' + count);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const additionalDishes = data.dishes;

    additionalDishes.forEach(dish => {
      const dishCard = createDishCard(dish);
      listElement.appendChild(dishCard);
    });

  } catch (error) {
    console.error('Error fetching additional dishes:', error);
    alert(`An error occurred while fetching additional dishes: ${error.message}`);
  }
}

function displayRestaurants(restaurants) {
  popularRestaurantsList.innerHTML = '';
  restaurants.forEach(restaurant => {
    const restaurantCard = createRestaurantCard(restaurant);
    popularRestaurantsList.appendChild(restaurantCard);
  });
}

function createDishCard(dish) {
  const card = document.createElement('li');
  card.classList.add('dish-card');
  card.innerHTML = `
    <img src="${dish.imageUrl}" alt="${dish.dishName}">
    <h6>${dish.dishName}</h6>
    <p>${dish.dishDescription}</p>
    <h6>Kes.${(dish.dishPrice * 1.2).toFixed(2)}</h6> 
    <button>Add to Cart</button>
    <p>${dish.restaurant ? dish.restaurant : 'Unknown Restaurant'}</p>
    <div class="rating" data-item-id="${dish.dishCode}" data-item-type="Dish">
      ${[1, 2, 3, 4, 5].map(star => `
        <span class="star" data-value="${star}">&#9733;</span>
      `).join('')}
    </div>
    <p>Average Rating: ${dish.averageRating.toFixed(2)} (${dish.ratingCount} ratings)</p>
  `;

  const button = card.querySelector('button');
  button.addEventListener('click', () => addToCart(dish)); 

  const stars = card.querySelectorAll('.star');
  stars.forEach(star => {
    star.addEventListener('click', () => submitRating(dish._id, 'Dish', star.getAttribute('data-value')));
  });
  setRatingStars(stars, dish.averageRating);
  return card;
}
// function setRatingStars(stars, averageRating) {
//   stars.forEach(star => {
//     const starValue = parseInt(star.getAttribute('data-value'));
//     if (starValue <= Math.round(averageRating)) {
//       star.classList.add('selected');
//     } else {
//       star.classList.remove('selected');
//     }

//     star.addEventListener('mouseover', () => { 

//       stars.forEach(s => {
//         if (parseInt(s.getAttribute('data-value')) <= starValue) {
//           s.classList.add('hover');
//         } else {
//           s.classList.remove('hover');
//         }
//       });
//     });
//     star.addEventListener('mouseout', () => {
//       stars.forEach(s => s.classList.remove('hover'));
//     });
//   });
// }

function setRatingStars(stars, averageRating) {
  stars.forEach(star => {
    const starValue = parseInt(star.getAttribute('data-value'));
    if (starValue <= Math.round(averageRating)) {
      star.classList.add('selected');
    } else {
      star.classList.remove('selected');
    }

    star.addEventListener('mouseover', () => {
      stars.forEach(s => s.classList.remove('hover'));
      for (let i = 0; i < starValue; i++) {
        stars[i].classList.add('hover');
      }
    });

    star.addEventListener('mouseout', () => { 
      stars.forEach(s => s.classList.remove('hover'));
    });
  });
}

function createRestaurantCard(restaurant) {
  const card = document.createElement('li'); 
  card.classList.add('restaurant-card'); 
  card.innerHTML = `
    <h5>${restaurant.restaurant}</h5>
    <p>Category: ${restaurant.dishCategory}</p>
    <div class="rating" data-item-id="${restaurant._id}" data-item-type="Restaurant"> 
      ${[1, 2, 3, 4, 5].map(star => `
        <span class="star" data-value="${star}">&#9733;</span>
      `).join('')}
    </div>
    <p>Average Rating: ${restaurant.averageRating.toFixed(2)} (${restaurant.ratingCount} ratings)</p>
  `;

  const stars = card.querySelectorAll('.star');
  stars.forEach(star => {
    star.addEventListener('click', () => submitRating(restaurant._id, 'Restaurant', star.getAttribute('data-value')));
  });
  
  setRatingStars(stars, restaurant.averageRating);
  return card;
}


async function updateAverageRating(itemId, itemType) {
  try {
    const response = await fetch(`http://localhost:3000/api/rating/${itemId}/${itemType}`);
    if (!response.ok) {
      throw new Error('Failed to fetch average rating');
    }
    const data = await response.json();
    console.log('Average rating updated:', data); 

    const ratingElement = document.querySelector(`.rating[data-item-id="${itemId}"][data-item-type="${itemType}"]`);
    if (ratingElement) {
      const averageRating = parseFloat(data.averageRating);
      ratingElement.nextElementSibling.innerText = `Average Rating: ${averageRating.toFixed(2)} (${data.ratingCount} ratings)`;
    }
  } catch (error) {
    console.error('Error updating average rating:', error);
  }
}

async function submitRating(itemId, itemType, rating) {
  try {
    const user = await getCurrentUser(); // Retrieve the current user
    const userId = user._id;

    const response = await fetch('http://localhost:3000/api/rating', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,
        item_id: itemId,
        item_type: itemType,
        rating: rating
      })
    });

    const data = await response.json();
    console.log('Rating submitted', data);

    if (data.success) {
      updateAverageRating(itemId, itemType);
    } else {
      console.error('Failed to submit rating:', data.message);
    }
  } catch (error) {
    console.error('Error submitting rating:', error);
  }
}

// category display section

document.getElementById('categoryDropdown').addEventListener('change', async (event) => {
  const category = event.target.value;
  if (category) {
    const dishes = await fetchDishesByCategory(category);
    displayDishesInModal(dishes);
  }
});

async function fetchDishesByCategory(category) {
  const response = await fetch(`http://localhost:3000/api/category-dishes?category=${encodeURIComponent(category)}`);
  return response.json();
}

function displayDishesInModal(dishes) {
  const dishContainer = document.getElementById('dishContainer');
  dishContainer.innerHTML = '';

  Object.keys(dishes).forEach(restaurant => {
    const restaurantSection = document.createElement('div');
    restaurantSection.innerHTML = `<h3>${restaurant}</h3>`;
    const dishList = document.createElement('ul');

    dishes[restaurant].forEach(dish => {
      dishList.appendChild(createDishCard(dish));
    });

    restaurantSection.appendChild(dishList);
    dishContainer.appendChild(restaurantSection);
  });

  openModal();
}
function openModal() {
  document.getElementById('dishModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('dishModal').style.display = 'none';
}

// Fetching restaurants and work on the selection
async function fetchRestaurants() {
  try {
    const response = await fetch('http://localhost:3000/api/restaurants');
    const { restaurants } = await response.json();
    
    const dropdown = document.getElementById('restaurantDropdown');
    dropdown.innerHTML = '<option disabled selected>Order by Restaurant</option>';
    
    restaurants.forEach(restaurant => {
      const option = document.createElement('option');
      option.textContent = restaurant;
      option.value = restaurant;
      dropdown.appendChild(option);
    });
  } catch (error) {
    console.error('Failed to fetch restaurants:', error);
    // Handle error gracefully, e.g., display a message to the user
  }
}

// Populate dropdown when the page loads
document.addEventListener('DOMContentLoaded', () => {
  fetchRestaurants();
});

// Open modal and fetch dishes for selected restaurant
document.getElementById('restaurantDropdown').addEventListener('change', async function () {
  const selectedRestaurant = this.value;
  if (selectedRestaurant !== 'Order by Restaurant') {
    const dishes = await fetchDishesByRestaurant(selectedRestaurant);
    openDishesModal(dishes);
  }
});

async function fetchDishesByRestaurant(restaurant) {
  try {
    const response = await fetch(`http://localhost:3000/api/restaurant-dishes?restaurant=${encodeURIComponent(restaurant)}&sortBy=all`);
    if (!response.ok) {
      throw new Error('Failed to fetch dishes');
    }
    const data = await response.json();
    console.log('Dishes data:', data); // Log the data received from the server

    if (!Array.isArray(data.dishes)) {
      throw new Error('Invalid dishes data');
    }

    return data.dishes; // Return the array of dishes directly
  } catch (error) {
    console.error('Failed to fetch dishes:', error);
    return []; // Return an empty array or handle error gracefully
  }
}


// Function to open modal with dishes
function openDishesModal(dishes) {
  console.log('Dishes received:', dishes); 
  const modalContent = document.getElementById('dishesModalContent');
  modalContent.innerHTML = '';

  if (!Array.isArray(dishes)) {
    console.error('Invalid dishes data:', dishes);
    // Handle the case where dishes data is not an array
    return;
  }

  const dishList = document.createElement('ul');
  dishes.forEach(dish => {
    const dishCard = createDishCard(dish);
    dishList.appendChild(dishCard);
  });
  modalContent.appendChild(dishList);
 
  const modal = new bootstrap.Modal(document.getElementById('dishesModal'));
  modal.show();
}