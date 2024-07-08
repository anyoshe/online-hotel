let slideIndex = 0;
showSlides();

function showSlides() {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("dot");
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  slideIndex++;
  if (slideIndex > slides.length) { slideIndex = 1 }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex - 1].style.display = "block";
  dots[slideIndex - 1].className += " active";
  setTimeout(showSlides, 5000); // Change image every 5 seconds
}

function plusSlides(n) {
  slideIndex += n;
  showSlides();
}

function currentSlide(n) {
  slideIndex = n;
  showSlides();
}

const script = document.createElement("script");
script.src =
  "https://maps.googleapis.com/maps/api/js?key=AIzaSyCmuVWpm0lkdNiq3wWZpEz0XYtDjmoN-wY&callback=initMap&libraries=places&loading=async"; // Replace 'YOUR_API_KEY' with your actual Google Maps API key
script.async = true;
document.head.appendChild(script);
let specialOrderMap, eventOrderMap, specialOrderMarker, eventOrderMarker;

function initMap() {
  const initialPosition = { lat: -3.2222, lng: 40.1167 };

  // Initialize the special order map
  specialOrderMap = new google.maps.Map(document.getElementById('map'), {
    zoom: 8,
    center: initialPosition
  });
  specialOrderMarker = new google.maps.Marker({
    position: initialPosition,
    map: specialOrderMap,
    draggable: true
  });
  google.maps.event.addListener(specialOrderMarker, 'dragend', function () {
    const position = specialOrderMarker.getPosition();
    document.getElementById('deliveryLocation').value = `${position.lat()}, ${position.lng()}`;
  });

  // Initialize the event order map
  eventOrderMap = new google.maps.Map(document.getElementById('mapE'), {
    zoom: 8,
    center: initialPosition
  });
  eventOrderMarker = new google.maps.Marker({
    position: initialPosition,
    map: eventOrderMap,
    draggable: true
  });
  google.maps.event.addListener(eventOrderMarker, 'dragend', function () {
    const position = eventOrderMarker.getPosition();
    document.getElementById('event-location').value = `${position.lat()}, ${position.lng()}`;
  });
}

function showMap(mapId) {
  document.getElementById(mapId).style.display = 'block';
  if (mapId === 'map') {
    google.maps.event.trigger(specialOrderMap, 'resize');
    // specialOrderMap.setCenter(specialOrderMarker.getPosition());
  } else if (mapId === 'mapE') {
    google.maps.event.trigger(eventOrderMap, 'resize');
    // eventOrderMap.setCenter(eventOrderMarker.getPosition());
  }
}


// JavaScript to handle form submission
$(document).ready(function () {
  $('#specialOrderForm').on('submit', function (event) {
    event.preventDefault();
    const formData = {
      customerName: $('#customerName').val(),
      customerEmail: $('#customerEmail').val(),
      customerPhone: $('#customerPhone').val(),
      deliveryLocation: $('#deliveryLocation').val(),
      deliveryDate: $('#deliveryDate').val(),
      deliveryTime: $('#deliveryTime').val(),
      orderDetails: $('#orderDetails').val(),
      specialInstructions: $('#specialInstructions').val()
    };
    $.ajax({
      type: 'POST',
      url: 'http://localhost:3000/api/special-orders',
      data: JSON.stringify(formData),
      contentType: 'application/json',
      success: function (response) {
        alert('Special order placed successfully!');
        $('#specialOrderModal').modal('hide');
        $('#specialOrderForm')[0].reset();
        // Reset the map to initial position
        initMap();
      },
      error: function (error) {
        alert('Failed to place the order. Please try again.');
      }
    });
  });
});
//event submission
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('event-order-form');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = {
      name: form.name.value,
      email: form.email.value,
      phone: form.phone.value,
      eventDate: form['event-date'].value,
      eventLocation: form['event-location'].value,
      message: form.message.value
    };

    try {
      const response = await fetch('http://localhost:3000/api/submit-event-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Event order submitted successfully');
        form.reset();
      } else {
        const error = await response.text();
        alert(`Error submitting event order: ${error}`);
      }
    } catch (error) {
      alert(`Error submitting event order: ${error.message}`);
    }
  });
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
            <img src="${data.imageUrl}" alt="${data.dishName}">
            <h5>${data.dishName}</h5>
            <p>${data.dishDescription}</p>
            <p>Category: ${data.dishCategory}</p> 
            <p>Restaurant: ${data.restaurant}</p>
            <p class= restaurant>Price: ${data.dishPrice * 1.2}</p>
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

// mic search functions
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
const modalBody = document.getElementById('custom-modal-body');
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
  } catch (error) {
    console.error(error);
    alert('An error occurred!');
  }
}

function openCustomModal(category) {
  const filteredDishes = allDishes.filter(dish => dish.dishCategory.toLowerCase() === category.toLowerCase());
  displayDishes(filteredDishes);
  $('#customModal').modal('show'); // Use jQuery to show the Bootstrap modal
}

function displayDishes(dishes) {
  modalBody.innerHTML = ''; // Clear existing content

  dishes.forEach(dish => {
    const dishItem = createDishElement(dish);
    modalBody.appendChild(dishItem);
  });
}

function createDishElement(dish) {
  const dishItem = document.createElement('div');
  dishItem.classList.add('dish-item', 'mb-3');

  const image = document.createElement('img');
  image.classList.add('dish-image', 'img-fluid', 'mb-2');
  image.src = dish.imageUrl;

  const name = document.createElement('p');
  name.textContent = dish.dishName;

  const description = document.createElement('p');
  description.textContent = dish.dishDescription;

  const price = document.createElement('p');
  price.textContent = `Kes. ${dish.dishPrice * 1.2}`;

  const button = document.createElement('button');
  button.textContent = 'Add to cart';
  button.classList.add('btn', 'btn-primary');

  dishItem.appendChild(image);
  dishItem.appendChild(name);
  dishItem.appendChild(description);
  dishItem.appendChild(price);
  dishItem.appendChild(button);

  return dishItem;
}

function closeCustomModal() {
  $('#customModal').modal('hide'); // Use jQuery to hide the Bootstrap modal
}

fetchDishes();


//Testmonials 
document.addEventListener("DOMContentLoaded", () => {
  const testimonialContainer = document.querySelector(".testimonial-container");

  // Fetch testimonials from the backend (replace 'your-api-endpoint' with the actual endpoint)
  fetch('http://localhost:3000/api/testimonials')
    .then(response => response.json())
    .then(data => {
      data.testimonials.forEach(testimonial => {
        const testimonialDiv = document.createElement("div");
        testimonialDiv.classList.add("testimonial");

        const testimonialText = document.createElement("p");
        testimonialText.classList.add("testimonial-text");
        testimonialText.textContent = `"${testimonial.message}"`;

        const customerName = document.createElement("p");
        customerName.classList.add("customer-name");
        customerName.textContent = `- ${testimonial.name}`;

        testimonialDiv.appendChild(testimonialText);
        testimonialDiv.appendChild(customerName);

        testimonialContainer.appendChild(testimonialDiv);
      });
    })
    .catch(error => console.error('Error fetching testimonials:', error));
});


// Tracking orders
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('trackOrderLink').addEventListener('click', function() {
    document.getElementById('orderTrackingModal').style.display = 'block';
  });

  document.getElementById('trackOrderButton').addEventListener('click', trackOrder);

  async function trackOrder() {
    const orderId = document.getElementById('orderIdInput').value.trim();
    try {
      const response = await fetch(`http://localhost:3000/api/orders/${orderId}`);
      const order = await response.json(); 
      console.log('Order data:', order);

      if (order) {
        document.getElementById('orderDetails2').innerHTML = `
          <p>Order ID: ${order.orderId}</p>
          <p>Customer Name: ${order.customerName}</p>
          <p>Phone Number: ${order.phoneNumber}</p>
          <p>Location: ${order.customerLocation}</p>
          <p>Expected Delivery Time: ${order.expectedDeliveryTime}</p>
          <p>Status: ${order.status}</p>
          <h3>Dishes:</h3>
          <ul>
            ${order.dishes.map(dish => `<li>${dish.dishName} - ${dish.quantity} @ ${dish.price}</li>`).join('')}
          </ul>
          <p>Total Price: ${order.totalPrice}</p>
        `;
        updateOrderSchematic(order.status);
      } else {
        document.getElementById('orderDetails2').innerText = 'Order not found.';
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      document.getElementById('orderDetails2').innerText = 'Error fetching order.';
    }
  }

  function updateOrderSchematic(status) {
    const steps = [
      'Order Placed',
      'Order Received',
      'Processed and packed', 
      'Dispatched',
      'Delivered',
      'Service Rating'
    ];
    console.log('Order status:', status);

  // Normalize the status string to match regardless of case
  const normalizedStatus = status.toLowerCase();
     // Reset all steps
     steps.forEach((step, index) => {
      const stepElement = document.getElementById(`step${index + 1}`);
      stepElement.classList.remove('completed');
    });

    // Mark completed steps
    steps.forEach((step, index) => {
      const normalizedStep = step.toLowerCase();
      const stepElement = document.getElementById(`step${index + 1}`);
      if (steps.findIndex(s => s.toLowerCase() === normalizedStatus) >= index) {
        stepElement.classList.add('completed');
      }
    });
  }
});
