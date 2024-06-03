document.addEventListener('DOMContentLoaded', () => {
  const openModalBtn = document.getElementById('openModalBtn');
  // const openModalVariety = document.getElementById('openModalVariety');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modalContainer = document.getElementById('modalContainer');
  // const modalContainerVariety = document.getElementById('modalContainerVariety');
  // Event listeners for opening the modal
  openModalBtn.addEventListener('click', () => {
    modalContainer.classList.remove('hidden');
  });

  // openModalVariety.addEventListener('click', () => {
  //   modalContainerVariety.classList.remove('hidden');
  // });

  openModalBtn.addEventListener('click', (event) => {
    event.preventDefault(); // Prevents the default action of the link
    modalContainer.classList.remove('hidden'); // Shows the modal
  });

  // openModalVariety.addEventListener('click', (event) => {
  //   event.preventDefault(); // Prevents the default action of the link
  //   modalContainerVariety.classList.remove('hidden'); // Shows the modal
  // });

  // Event listener for closing the modal
  closeModalBtn.addEventListener('click', () => {
    modalContainer.classList.add('hidden');
  });
  // closeModalBtn.addEventListener('click', () => {
  //   modalContainerVariety.classList.add('hidden');
  // });

  // Improved window click event listener
  window.addEventListener('click', (event) => {
    // Check if the clicked element is the modal container or a child of the modal container
    if (event.target === modalContainer || modalContainer.contains(event.target)) {
      modalContainer.classList.add('hidden');
    }
  });

  // window.addEventListener('click', (event) => {
  //   // Check if the clicked element is the modal container or a child of the modal container
  //   if (event.target === modalContainerVariety || modalContainerVariety.contains(event.target)) {
  //     modalContainerVariety.classList.add('hidden');
  //   }
  // });

});

document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById('searchQuery');
  const searchResults = document.getElementById('searchResults');
  const detailContainer = document.getElementById('details');

  searchInput.addEventListener('input', function () {
    const searchTerm = searchInput.value.trim();
    if (!searchTerm) return;


    fetch(`http://localhost:3000/api/searchAny?q=${encodeURIComponent(searchTerm)}&type=suggestion`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data && Array.isArray(data)) {
          detailContainer.innerHTML = '';
          // const suggestionsHtml = data.map(item => `<div class="suggestion-item" data-id="${item.dishCode}">${item.dishName} - ${item.dishCategory} - ${item.restaurant}</div>`).join('');
          const suggestionsHtml = data.map(item => `<div class="suggestion-item" data-dish-code="${item.dishCode}">${item.dishName} - ${item.dishCategory} - ${item.restaurant}</div>`).join('');

          searchResults.innerHTML = suggestionsHtml;
        } else {
          console.error('Unexpected data structure:', data - id);
          searchResults.innerHTML = '<p>No suggestions available.</p>';
        }
      })
      .catch(error => {
        console.error('Error fetching suggestions:', error);
        searchResults.innerHTML = '<p>Error fetching suggestions. Please try again later.</p>';
      });
  });

  searchResults.addEventListener('click', function (e) {
    if (e.target.classList.contains('suggestion-item')) {
      const selectedItem = e.target.dataset.dishCode;
      console.log("Selected Item:", selectedItem); // Debugging line
      fetchDetails(selectedItem);
    } else {
      console.error("No dishCode found");
    }
  });
  document.addEventListener('click', () => {
    searchResults.innerHTML = '';
  })


  function fetchDetails(dishCode) {
    const url = `http://localhost:3000/api/dishes/details/${encodeURIComponent(dishCode)}`;

    fetch(url)
      .then(response => {
        // console.log(response)
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      // console.log(data)
      .then(data => {
        console.log(data);
        if (data && Object.keys(data).length > 0) {
          searchResults.innerHTML = '';
          const detailHtml = `
          <div class="detail-container">
            <img src="path/to/image.jpg" alt="${data.dishName}">
            <h2>${data.dishName}</h2>
            <p>${data.dishDescription}</p>
            <p>Category: ${data.dishCategory}</p>
            <p>Restaurant: ${data.restaurant}</p>
            <p>Price: ${data.dishPrice*1.2}</p>
          </div>`;
          detailContainer.innerHTML = detailHtml;
        } else {
          console.error('No details found for this dish.');
          detailContainer.innerHTML = '<p>No details available for this dish.</p>';
        }
      })
      .catch(error => {
        console.error('Error fetching details:', error);
        detailContainer.innerHTML = '<p>Error fetching details. Please try again later.</p>';
      });

  }
  document.addEventListener('click', () => {
    detailContainer.innerHTML = '';
  });

});
// document.addEventListener('DOMContentLoaded', function () {
//   const searchInput = document.getElementById('searchQuery');
//   const searchResults = document.getElementById('searchResults');
//   const detailContainer = document.getElementById('details');

//   searchInput.addEventListener('input', function () {
//       const searchTerm = searchInput.value.trim();
//       if (!searchTerm) return;

//       let searchType = 'dish'; // Default to dish search
//       if (/category/.test(searchTerm)) {
//           searchType = 'category';
//       } else if (/restaurant/.test(searchTerm)) {
//           searchType = 'restaurant';
//       }

//       switch (searchType) {
//           case 'dish':
//               fetchDishes(searchTerm);
//               break;
//           case 'category':
//               fetchCategories(searchTerm);
//               break;
//           case 'restaurant':
//               fetchRestaurants(searchTerm);
//               break;
//           default:
//               console.error('Unsupported search type:', searchType);
//       }
//   });

//   async function fetchDishes(searchTerm) {
//     const response = await fetch(`http://localhost:3000/api/dishes?s=${encodeURIComponent(searchTerm)}`);
//     const dishes = await response.json();
//     if (dishes.length === 0) {
//         searchResults.innerHTML = '<p>No dishes found.</p>';
//     } else {
//         const dishesHtml = dishes.map(dish => `
//             <div class="suggestion-item" data-dish-code="${dish.dishCode}">
//                 ${dish.dishName} - ${dish.dishCategory} - ${dish.restaurant}
//             </div>`).join('');
//         searchResults.innerHTML = dishesHtml;
//     }
// }


// async function fetchCategories(searchTerm) {
//   const response = await fetch(`http://localhost:3000/api/categories/suggestions?categoryName=${encodeURIComponent(searchTerm)}`);
//   const categories = await response.json();
//   if (categories.length === 0) {
//       searchResults.innerHTML = '<p>No categories found.</p>';
//   } else {
//       const categoriesHtml = categories.map(category => `
//           <div class="suggestion-item" data-category-name="${category.dishCategory}">
//               ${category.dishCategory}
//           </div>`).join('');
//       searchResults.innerHTML = categoriesHtml;
//   }
// }


// async function fetchRestaurants(searchTerm) {
//   const response = await fetch(`http://localhost:3000/api/restaurants/suggestions?restaurantName=${encodeURIComponent(searchTerm)}`);
//   const restaurants = await response.json();
//   if (restaurants.length === 0) {
//       searchResults.innerHTML = '<p>No restaurants found.</p>';
//   } else {
//       const restaurantsHtml = restaurants.map(restaurant => `
//           <div class="suggestion-item" data-restaurant-name="${restaurant.restaurant}">
//               ${restaurant.restaurant}
//           </div>`).join('');
//       searchResults.innerHTML = restaurantsHtml;
//   }
// }



//   // Function to fetch and display dish details
//   async function fetchDetails(dishCode) {
//       const url = `http://localhost:3000/api/dishes/details/${encodeURIComponent(dishCode)}`;
//       const response = await fetch(url);
//       const data = await response.json();
//       if (data && Object.keys(data).length > 0) {
//           detailContainer.innerHTML = `
//           <div class="detail-container">
//               <img src="path/to/image.jpg" alt="${data.dishName}">
//               <h2>${data.dishName}</h2>
//               <p>${data.dishDescription}</p>
//               <p>Category: ${data.dishCategory}</p>
//               <p>Restaurant: ${data.restaurant}</p>
//               <p>Price: ${data.dishPrice}</p>
//           </div>`;
//       } else {
//           detailContainer.innerHTML = '<p>No details found for this dish.</p>';
//       }
//   }
// });
// const searchBar = document.getElementById('search-bar');
// const voiceSearchButton = document.getElementById('voice-search');
// const searchButton = document.getElementById('search-button');

// // Replace with your actual function to handle search query (backend integration)
// function handleSearch(query) {
//   console.log(`Search query: ${query}`);
//   // Perform search using your backend logic here
// }

// // Voice search functionality using Web Speech API
// if (window.SpeechRecognition || window.webkitSpeechRecognition) {
//   const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

//   voiceSearchButton.addEventListener('click', () => {
//     recognition.start();
//     recognition.onresult = (event) => {
//       const searchQuery = event.results[0][0].transcript;
//       searchBar.value = searchQuery;
//     };
//   });
// } else {
//   voiceSearchButton.disabled = true;
//   console.error('Speech Recognition is not supported by your browser');
// }

// // Handle search on button click or enter key press
// searchButton.addEventListener('click', () => {
//   const searchQuery = searchBar.value.trim();
//   if (searchQuery) {
//     handleSearch(searchQuery);
//   }
// });

// searchBar.addEventListener('keypress', (event) => {
//   if (event.key === 'Enter') {
//     const searchQuery = searchBar.value.trim();
//     if (searchQuery) {
//       handleSearch(searchQuery);
//     }
//   }
// });

const recognition = new window.webkitSpeechRecognition();
const startButton = document.querySelector("#start");
const stopButton = document.querySelector("#stop");

startButton.addEventListener("click", (event) => {
  if (startButton.classList.contains("show")) {
    startButton.classList.add("hide");
    startButton.classList.remove("show");
    stopButton.classList.remove("hide");
    stopButton.classList.add("show");
    startRecording();
  }
});

stopButton.addEventListener("click", (event) => {
  if (stopButton.classList.contains("show")) {
    stopButton.classList.remove("show");
    stopButton.classList.add("hide");
    startButton.classList.add("show");
    startButton.classList.remove("hide");
    stopRecording();
  }
});

function startRecording() {
  recognition.start();
}

function stopRecording() {
  recognition.stop();
}

recognition.onresult = function (event) {
  let saidText = "";
  for (let i = event.resultIndex; i < event.results.length; i++) {
    if (event.results[i].isFinal) {
      saidText = event.results[i][0].transcript;
    } else {
      saidText += event.results[i][0].transcript;
    }
  }
  document.getElementById("searchQuery").value = saidText;
  // Trigger the search functionality
  const searchInput = document.getElementById('searchQuery');
  searchInput.dispatchEvent(new Event('input'));
};

recognition.onend = function (event) {
  stopButton.classList.remove("show");
  stopButton.classList.add("hide");
  startButton.classList.add("show");
  startButton.classList.remove("hide");
};
saidText = '';


// fetchDishes();
const modal = document.getElementById("dishModal");
const dishList = document.getElementById('dish-list');
let allDishes = []; // Store all fetched dishes

async function fetchDishes() {
  try {
    const response = await fetch('http://localhost:3000/api/v1/dishes');
    const data = await response.json();

    if (data.error) {
      console.error(data.error);
      alert('Failed to retrieve dishes!');
      return;
    }

    allDishes = data.dishes;
    // Display all dishes on page load (assuming "Popular Dishes" represents all dishes)
    filterDishes('Popular Dishes');
  } catch (error) {
    console.error(error);
    alert('An error occurred!');
  }
}

function filterDishes(category) {
  let filteredDishes;
  if (category === 'All') {
    filteredDishes = allDishes;
  } else {
    filteredDishes = allDishes.filter(dish => dish.dishCategory.toLowerCase() === category.toLowerCase());
  }
  displayDishes(filteredDishes, category);
}

function displayDishes(dishes, category) {
  dishList.innerHTML = ''; // Clear existing content

  if (dishes.length === 0 && category !== 'All') {
    // Only display message for non-"All" filters with no results
    dishList.innerHTML = '<p>No dishes found for this category.</p>';
    return;
  }

  dishes.forEach(dish => {
    const dishItem = document.createElement('div');
    dishItem.classList.add('dish-item');

    const image = document.createElement('img');
    image.classList.add('dish-image');
    image.src = dish.image;

    const name = document.createElement('p');
    name.textContent = dish.dishName;

    const description = document.createElement('p');
    description.textContent = dish.dishDescription;
   
    const price = document.createElement('p');
    price.textContent = `Kes.${dish.dishPrice * 1.2}`;

    const button = document.createElement('button');
    button.textContent = `Add to cart`;

   
    dishItem.appendChild(image);
    dishItem.appendChild(name);
    dishItem.appendChild(description);
    dishItem.appendChild(price);
    dishItem.appendChild(button);

    dishList.appendChild(dishItem);
    modal.style.display = "block";
  });
}
function closeModal() {
  document.getElementById("dishModal").style.display = "none";
}

// Close the modal if the user clicks outside of it
window.onclick = function (event) {
  const modal = document.getElementById("dishModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
}

fetchDishes();

