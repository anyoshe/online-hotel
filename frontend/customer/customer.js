function mapLoaded() {
  // Google Maps API is loaded here
  initMap(); // Now you can call initMap safely
}

function initMap() {  
    // Create a default map centered on Kenya (adjust as needed)
    const map = new google.maps.Map(document.getElementById("map-container"), {
      zoom: 14,
      center: {lat: -1.29497, lng: 36.82334 }, // Coordinates for Nairobi
    }); 
    const TOWN_LATITUDE = -1.29497;
  const TOWN_LONGITUDE = 36.82334;
  const townCenter = { lat: TOWN_LATITUDE, lng: TOWN_LONGITUDE }; // Replace with your town's coordinates
  const zoomLevel = 14; // Adjust zoom level for town view (higher = closer)

    // Add event listener for location selection change
    const locationSelect = document.getElementById("location-select");
    locationSelect.addEventListener("change", (event) => {
      const selectedLocation = event.target.value;
      updateMap(selectedLocation, map);
      document.getElementById("map-container").classList.remove("hidden"); // Unhide map container
    });
  
    // Function to update map based on selected location (replace with actual coordinates)
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
        // Add cases for other locations with their respective coordinates
        default:
          return; // Handle cases where no location is selected
      }
  
      map.setCenter(center); // Update map center
    }

  }


  function getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
        placeMarker(userLocation); // Add a marker at the user's location
      }, 
        (error) => {
          console.error("Error getting user location:", error.message);
          // Handle geolocation errors gracefully (e.g., display informational message)
        }
      );
    } else {
      console.warn("Geolocation is not supported by this browser.");
    }
  }
  
  google.maps.event.addListener(map, 'click', function(event) {
    placeMarker(event.latLng); // Place a marker on the clicked location
  });
  function placeMarker(location) {
    const marker = new google.maps.Marker({
      position: location,
      map: map, // Reference the map object
    });
  
    // (Optional) Add event listener for marker drag (to capture user-adjusted location)
    marker.addListener('dragend', function(e) {
    //   const newLocation = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      const selectedLocationInput = document.getElementById("selectedLocation");
  selectedLocationInput.value = JSON.stringify(location); // Convert location to JSON string
  const confirmLocationButton = document.getElementById("confirmLocation");
  confirmLocationButton.disabled = false; // Enable confirmation button

})
      // Update hidden input field with new location coordinates (explained later)
   // });
   // Optional: Add animation to highlight marker placement
  marker.setAnimation(google.maps.Animation.BOUNCE);
  setTimeout(function() {
    marker.setAnimation(null);
  }, 700); // Stop bounce animation after 0.7 seconds
  }
  

  const confirmLocationButton = document.getElementById("confirmLocation");
  confirmLocationButton.addEventListener("click", function() {
    // Submit order form (using existing logic)
  });
// // frontend.js
// document.addEventListener('DOMContentLoaded', function() {
//   const modal = document.getElementById('authModal');
//   const signInBtn = document.getElementById('signinBtn');
//   const signUpBtn = document.getElementById('signupBtn');
//   const modalTitle = document.getElementById('modalTitle');
//   const actionBtn = document.getElementById('actionBtn');
//   const usernameInput = document.getElementById('username');
//   const passwordInput = document.getElementById('password');

//   signInBtn.addEventListener('click', function() {
//       openModal('Sign In');
//   });

//   signUpBtn.addEventListener('click', function() {
//       openModal('Sign Up');
//   });

//   function openModal(title) {
//       modalTitle.textContent = title;
//       modal.style.display = 'block';
//       actionBtn.textContent = title;

//       // Clear input fields
//       usernameInput.value = '';
//       passwordInput.value = '';
//   }

//   document.getElementsByClassName('close')[0].onclick = function() {
//       modal.style.display = "none";
//   }

//   window.onclick = function(event) {
//       if (event.target == modal) {
//           modal.style.display = "none";
//       }
//   }

//   actionBtn.addEventListener('click', function() {
//       const username = usernameInput.value;
//       const password = passwordInput.value;
//       const url = actionBtn.textContent === 'Sign In' ? '/signin' : '/signup';
      
//       // Send request to backend for authentication
//       fetch('http://localhost:3000/api/signin', {
//           method: 'POST', 

//           headers: {
//               'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({ username, password })
//       })
//       .then(response => {
//           if (!response.ok) { 
//               throw new Error(`HTTP error! status: ${response.status}`);
//           }
//           return response.json();
//       })
//       .then(data => {
//           alert(data.message); // Display success message
//           modal.style.display = "none"; // Close modal
//       })
//       .catch(error => {
//           console.error('Error:', error);
//           alert('Failed to authenticate'); // Display error message 
//       });
//   });
// });
