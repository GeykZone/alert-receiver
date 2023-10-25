export function genMap(origin, destinations, mapboxAccessToken, profile_name, hq) {
  // Find the parent element with id "map-box"
  const mapBox = document.getElementById('map-box');

  // Check if the map div already exists
  const mapDiv = document.getElementById('map');
  if (mapDiv) {
    // If it exists, remove it
    mapBox.removeChild(mapDiv);
  }

  // If it doesn't exist, create and append the new div
  const newMapDiv = document.createElement('div');
  newMapDiv.id = 'map'; // Set the id attribute
  mapBox.appendChild(newMapDiv);

  // Initialize the map
  mapboxgl.accessToken = mapboxAccessToken;
  let map = new mapboxgl.Map({
    container: 'map',
    // Specify the ID of the container element
    style: 'mapbox://styles/mapbox/streets-v11',
    // Map style
    center: origin,
    // Initial map center
    zoom: 16,
    // Initial zoom level
    scrollZoom: false // Disable zooming with the mouse scroll wheel
  });

  // Create a function to update the map with new destinations
  function updateMap(newDestinations) {
    console.log(newDestinations);
    // Remove existing markers and routes

    map.remove();

    // Recreate the map
    map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: origin,
      zoom: 16,
      pitch: 45,
      bearing: -17.6,
      container: 'map',
      antialias: true,
      scrollZoom: false
    });
    map.on('style.load', function () {
      // Add a navigation control (optional)
      map.addControl(new mapboxgl.NavigationControl());

      // Create a marker for the origin and name it marker_origin
      const marker_origin = new mapboxgl.Marker({
        element: createCustomMarkerElementForOrigin(),
        anchor: 'bottom'
      }).setLngLat(origin).addTo(map);

      // Create a origin custom popup
      const originCustomPopup = new mapboxgl.Popup({
        offset: 30
      }).setDOMContent(createCustomPopupContentForOrigin());

      // Set the popup for the marker
      marker_origin.setPopup(originCustomPopup);

      // Show the popup on marker hover
      marker_origin.getElement().addEventListener('mouseenter', () => {
        marker_origin.togglePopup();
      });

      // Remove the popup on marker mouseleave
      marker_origin.getElement().addEventListener('mouseleave', () => {
        marker_origin.togglePopup();
      });

      // Loop through the new destinations and calculate routes
      newDestinations.forEach((destination, index) => {
        // Use the Mapbox Directions API to calculate and display the route
        const apiUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination.coordinates[0]},${destination.coordinates[1]}?alternatives=true&geometries=geojson&language=en&overview=full&steps=true&access_token=${mapboxAccessToken}`;
        fetch(apiUrl).then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        }).then(data => {
          // Add the route to the map with the specified color
          map.addSource(`route-${index}`, {
            type: 'geojson',
            data: data.routes[0].geometry
          });
          map.addLayer({
            id: `route-${index}`,
            type: 'line',
            source: `route-${index}`,
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': destination.color,
              // Use the specified color for each route
              'line-width': 5
            }
          });
        }).catch(error => {
          console.error('There was a problem with the fetch operation:', error);
        });

        // Create a marker for the destination and name it marker_destination
        const marker_destination = new mapboxgl.Marker({
          element: createCustomMarkerElementForDestination(index),
          anchor: 'bottom'
        }).setLngLat(destination.coordinates).addTo(map);

        // Create a custom popup
        const destinationCustomPopup = new mapboxgl.Popup({
          offset: 30
        }).setDOMContent(createCustomPopupContentForDestination(index));

        // Set the popup for the marker
        marker_destination.setPopup(destinationCustomPopup);

        // Show the popup on marker hover
        marker_destination.getElement().addEventListener('mouseenter', () => {
          destinationCustomPopup.addTo(map);
        });

        // Remove the popup on marker mouseleave
        marker_destination.getElement().addEventListener('mouseleave', () => {
          destinationCustomPopup.remove();
        });

        // Store the destination information as a property of the marker
        marker_destination.properties = {
          name: `Destination ${index + 1}`,
          filepath: destination.filepath,
          location_id: destination.location_id,
          alert_by: destination.alert_by
        };

        // Add data-coreui-toggle and data-coreui-target attributes to the marker element
        marker_destination.getElement().setAttribute('data-coreui-toggle', 'modal');
        marker_destination.getElement().setAttribute('data-coreui-target', '#show_accident_incident_area');

        // Show the custom popup on marker click
        marker_destination.getElement().addEventListener('click', () => {
          const fileUrl = marker_destination.properties.filepath;
          const alertLocation = marker_destination.properties.location_id;
          const alertBy = marker_destination.properties.alert_by;
          setContent(fileUrl, alertLocation, alertBy);
        });
      });
    });
  }

  // Call the updateMap function with the initial destinations
  updateMap(destinations);

  // Get elements by class name
  const headerTogglers = document.getElementsByClassName("header-toggler");
  const sidebarTogglers = document.getElementsByClassName("sidebar-toggler");

  // Loop through the elements and add event listener
  for (let i = 0; i < headerTogglers.length; i++) {
    headerTogglers[i].addEventListener("click", function () {
      // Trigger a map resize event when the sidebar state changes
      setTimeout(() => {
        map.resize();
      }, 300);
    });
  }
  for (let i = 0; i < sidebarTogglers.length; i++) {
    sidebarTogglers[i].addEventListener("click", function () {
      // Trigger a map resize event when the sidebar state changes
      setTimeout(() => {
        map.resize();
      }, 300);
    });
  }

  // Function to create a custom marker element for destination
  function createCustomMarkerElementForDestination(index) {
    const customMarker = document.createElement('div');
    customMarker.className = 'custom-marker';
    customMarker.style.backgroundImage = `url('../assets/brand/alert.png')`; // Adjust the path accordingly
    customMarker.style.width = '50px'; // Adjust the width and height of your custom marker
    customMarker.style.height = '50px';
    customMarker.style.backgroundSize = 'cover'; // Set the background size to cover
    return customMarker;
  }

  // Function to create a custom marker element for the origin
  function createCustomMarkerElementForOrigin() {
    const customMarker = document.createElement('div');
    customMarker.className = 'custom-marker';
    customMarker.style.backgroundImage = 'url("../assets/brand/police.png")'; // Specify the path to your custom origin marker image
    customMarker.style.width = '70px'; // Adjust the width and height as needed
    customMarker.style.height = '70px';
    customMarker.style.backgroundSize = 'cover'; // Maintain the image aspect ratio

    return customMarker;
  }

  //customPopup for origin
  function createCustomPopupContentForOrigin() {
    // Create a container element for the popup
    const popupContainer = document.createElement('div');
    popupContainer.className = 'custom-popup';

    // Add your custom content to the popup
    const popupContent = document.createElement('div');
    popupContent.textContent = profile_name + ' station ' + hq + ' headquarter.';

    // Append the content to the container
    popupContainer.appendChild(popupContent);
    return popupContainer;
  }
  function createCustomPopupContentForDestination(index) {
    // Create a container element for the popup
    const popupContainer = document.createElement('div');
    popupContainer.className = 'custom-popup';

    // Add your custom content to the popup
    const popupContent = document.createElement('div');
    popupContent.textContent = `Destination ${index + 1}`;

    // Append the content to the container
    popupContainer.appendChild(popupContent);
    return popupContainer;
  }

  // Function to set the content based on file extension
  function setContent(fileUrl, alertLocation, alertBy) {
    const fileExtension = getFileExtension(fileUrl);
    const videoElement = document.getElementById('videoElement');
    const videoContainer = document.getElementById('videoContainer');
    const imageElement = document.getElementById('imageElement');
    const imageContainer = document.getElementById('imageContainer');
    const incidentLocation = document.getElementById('accident_incident_area_title');
    const personWhoAlerted = document.getElementById('alerterId');
    incidentLocation.textContent = alertLocation;
    personWhoAlerted.textContent = alertBy;
    const videoExtensions = ['mp4', 'webm', 'ogg'];
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    if (videoExtensions.includes(fileExtension)) {
      // Display the video element
      videoElement.style.display = 'block';
      videoContainer.classList.remove('d-none');
      imageContainer.classList.add('d-none');
      imageElement.style.display = 'none';
      videoElement.src = fileUrl;
      videoElement.load();
    } else if (imageExtensions.includes(fileExtension)) {
      // Display the image element
      imageElement.style.display = 'block';
      videoElement.style.display = 'none';
      videoContainer.classList.add('d-none');
      imageContainer.classList.remove('d-none');
      imageElement.src = fileUrl; // Set the source for the image
      const imageLink = document.getElementById('imageLink');
      imageLink.href = fileUrl; // Set the link to the extracted file URL
    }
  }

  function getFileExtension(url) {
    const path = new URL(url).pathname;
    const parts = path.split('.');
    if (parts.length > 1) {
      return parts[parts.length - 1].toLowerCase();
    }
    return null;
  }
}
//# sourceMappingURL=alert_map.js.map