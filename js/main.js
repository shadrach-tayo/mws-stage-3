let restaurants, neighborhoods, cuisines;
var newMap;
var markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener ('DOMContentLoaded', event => {
  initMap (); // added
  fetchNeighborhoods ();
  fetchCuisines ();
  registerServiceWorker ();
});

/*
  Register service worker
*/
registerServiceWorker = () => {
  if (navigator.serviceWorker) {
    navigator.serviceWorker.register ('sw.js', {scope: '/'}).then (reg => {
      let serviceWorker;

      // check worker status
      if (reg.installing) serviceWorker = reg.installing;
      else if (reg.waiting) serviceWorker = reg.waiting;
      else if (reg.active) serviceWorker = reg.active;

      if (serviceWorker) {
        console.log ('[service-worker] has been registered', reg);
      }

      // Add listener to track serviceWorker update event
      reg.addEventListener ('updatefound', () => {
        trackInstalling (reg.installing);
      });
    });
  }
};

/**
 * function to track update in serviceWorker
*/
let refreshing = false;
trackInstalling = worker => {
  worker.addEventListener ('statechange', () => {
    if ((worker.state = 'installed')) {
      // function to  update to newly installed worker
      updateWorker (worker);
    }
  });
};

updateWorker = worker => {
  worker.postMessage ({action: 'skipWaiting'});
  if (!refreshing) reloadPage ();
  refreshing = true;
  console.log ('worker updated');
};

reloadPage = () => {
  window.location.reload ();
};

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods ()
    .then (neighborhoods => {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML ();
    })
    .catch (err => console.log (err));
};

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById ('neighborhoods-select');
  neighborhoods.forEach (neighborhood => {
    const option = document.createElement ('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append (option);
  });
};

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines ()
    .then (cuisines => {
      self.cuisines = cuisines;
      fillCuisinesHTML ();
    })
    .catch (err => console.log ('could not fetch cuisines'));
};

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById ('cuisines-select');

  cuisines.forEach (cuisine => {
    const option = document.createElement ('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append (option);
  });
};

/**
 * Initialize leaflet map, called from HTML.
 */
initMap = () => {
  self.newMap = L.map ('map', {
    center: [40.722216, -73.987501],
    zoom: 12,
    scrollWheelZoom: false,
  });
  L.tileLayer (
    'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}',
    {
      mapboxToken: 'pk.eyJ1Ijoic2hhZHJhY2gxOTk5IiwiYSI6ImNqa2VxamJyNjAwOWgzamw3NTVrbnczYTAifQ.9XTn2MpN632TEngZkjqOPA',
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: 'mapbox.streets',
    }
  ).addTo (newMap);

  updateRestaurants ();
};

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById ('cuisines-select');
  const nSelect = document.getElementById ('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood (cuisine, neighborhood)
    .then (restaurants => {
      resetRestaurants (restaurants);
      fillRestaurantsHTML ();
    })
    .catch (err =>
      console.error ('could not fetch restaurant by cuisine and neighbourhood')
    );
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = restaurants => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById ('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach (marker => marker.remove ());
  }
  self.markers = [];
  self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById ('restaurants-list');
  restaurants.forEach (restaurant => {
    ul.append (createRestaurantHTML (restaurant));
  });
  addMarkersToMap ();
};

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = restaurant => {
  const div = document.createElement ('div');
  div.className = 'restaurant-card';
  const image = document.createElement ('img');
  image.className = 'restaurant-img';
  image.src = `img/${restaurant.photograph}.jpg`;
  image.sizes = `(max-width: 200px) 25vw, (min-width: 200px) 50vw', 100vw`;
  image.srcset = `img/${restaurant.photograph}.jpg 50w, img/${restaurant.photograph}.jpg 100w`;
  image.alt = restaurant.name;
  div.append (image);

  const details = document.createElement ('div');
  details.className = 'restaurant-details';
  const name = document.createElement ('h1');
  name.innerHTML = restaurant.name;
  details.append (name);

  const neighborhood = document.createElement ('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  details.append (neighborhood);

  const address = document.createElement ('p');
  address.innerHTML = restaurant.address;
  details.append (address);

  const more = document.createElement ('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant (restaurant);
  details.append (more);
  div.append (details);
  return div;
};

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach (restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant (restaurant, self.newMap);
    marker.on ('click', onClick);
    function onClick () {
      window.location.href = marker.options.url;
    }
    self.markers.push (marker);
  });
};
