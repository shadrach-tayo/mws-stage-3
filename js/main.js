class MainHelper {
  constructor() {
    this.db = RestaurantsDb;
    this.initMap();
    this.fetchNeighborhoods();
    this.fetchCuisines();
    this.registerServiceWorker();
    this.getFilterButtons();
    this.refreshing = false;

  }

  getFilterButtons() {
    const neighborhoodSelect = document.querySelector('#neighborhoods-select');
    const cuisineSelect = document.querySelector('#cuisines-select');

    this.addListener('change', neighborhoodSelect, this.updateRestaurants.bind(this));
    this.addListener('change', cuisineSelect, this.updateRestaurants.bind(this));
  }

  addListener(evt, target, callback) {
    target.addEventListener(evt, callback);
  }

  /**
  * Initialize leaflet map, called from HTML.
  */
  initMap() {
    this.newMap = L.map ('map', {
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
    ).addTo(this.newMap);

    this.updateRestaurants();
  };

  /**
   * Fetch all neighborhoods and set their HTML.
  */
  fetchNeighborhoods() {
    this.db.fetchNeighborhoods()
      .then(neighborhoods => {
        this.neighborhoods = neighborhoods;
        this.fillNeighborhoodsHTML();
      })
      .catch (err => console.log (err));
  };

  /**
   * Fetch all cuisines and set their HTML.
   */
  fetchCuisines() {
    this.db.fetchCuisines()
      .then(cuisines => {
        this.cuisines = cuisines;
        this.fillCuisinesHTML();
      })
      .catch (err => console.log ('could not fetch cuisines'));
  };

  /**
  * Registers serviceWorker
  */
  registerServiceWorker() {
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
          this.trackInstalling(reg.installing);
        });
      });
    }
  };


  /**
  * Update page and map for current restaurants.
  */
  updateRestaurants() {
    const cSelect = document.getElementById ('cuisines-select');
    const nSelect = document.getElementById ('neighborhoods-select');

    const cIndex = cSelect.selectedIndex;
    const nIndex = nSelect.selectedIndex;

    const cuisine = cSelect[cIndex].value;
    const neighborhood = nSelect[nIndex].value;

    this.db.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood)
      .then(restaurants => {
        this.resetRestaurants(restaurants);
        this.fillRestaurantsHTML();
      })
      .catch(err =>
        console.error(err, ' :could not fetch restaurant by cuisine and neighbourhood')
      );
  };

  
  /**
  * function to track update in serviceWorker
  */
  trackInstalling(worker) {
    worker.addEventListener ('statechange', () => {
      if ((worker.state = 'installed')) {
        // function to  update to newly installed worker
        this.updateWorker(worker);
      }
    });
  };

  updateWorker(worker) {
    worker.postMessage({action: 'skipWaiting'});
    if (!this.refreshing) this.reloadPage();
    this.refreshing = true;
    console.log ('worker updated');
  };

  /**
  * Set neighborhoods HTML.
  */
  fillNeighborhoodsHTML(neighborhoods = this.neighborhoods) {
    const select = document.getElementById('neighborhoods-select');
    neighborhoods.forEach(neighborhood => {
      const option = document.createElement('option');
      option.innerHTML = neighborhood;
      option.value = neighborhood;
      select.append(option);
    });
  };

  /**
  * Set cuisines HTML.
  */
  fillCuisinesHTML(cuisines = this.cuisines) {
    const select = document.getElementById('cuisines-select');
    cuisines.forEach(cuisine => {
      const option = document.createElement('option');
      option.innerHTML = cuisine;
      option.value = cuisine;
      select.append(option);
    });
  };

  /**
  * Clear current restaurants, their HTML and remove their map markers.
  */
  resetRestaurants(restaurants) {
    // Remove all restaurants
    this.restaurants = [];
    const div = document.getElementById ('restaurants-list');
    div.innerHTML = '';

    // Remove all map markers
    if (this.markers) {
      this.markers.forEach(marker => marker.remove());
    }
    this.markers = [];
    this.restaurants = restaurants;
  };

  
  /**
   * Create all restaurants HTML and add them to the webpage.
   */
  fillRestaurantsHTML(restaurants = this.restaurants) {
    const ul = document.getElementById ('restaurants-list');
    restaurants.forEach (restaurant => {
      ul.append(this.createRestaurantHTML(restaurant));
    });
    this.addMarkersToMap();
  };

  
  /**
  * Creates restaurant HTML.
  */
  createRestaurantHTML(restaurant) {
    const div = document.createElement ('div');
    div.className = 'restaurant-card';
    const image = document.createElement ('img');
    image.className = 'restaurant-img';
    image.src = `img/${restaurant.photograph}.jpg`;
    image.sizes = `(max-width: 200px) 25vw, (min-width: 200px) 50vw', 100vw`;
    image.srcset = `img/${restaurant.photograph}.jpg 50w, img/${restaurant.photograph}.jpg 100w`;
    image.alt = restaurant.name;
    div.append(image);

    // create favorite button for this particular restaurant
    const favBtn = document.createElement('button');
    favBtn.className = 'favorite-btn';
    new FavoriteBtn(favBtn, restaurant);
    div.append(favBtn);

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
    more.href = this.db.urlForRestaurant(restaurant)
    details.append (more);
    div.append (details);
    return div;
  };

  /**
  * Add markers for current restaurants to the map.
  */
  addMarkersToMap(restaurants = this.restaurants) {
    restaurants.forEach(restaurant => {
      // Add marker to the map
      const marker = this.db.mapMarkerForRestaurant(restaurant, this.newMap);
      marker.on ('click', onClick);
      function onClick () {
        window.location.href = marker.options.url;
      }
      this.markers.push(marker);
    });
  };

  reloadPage() {
    window.location.reload ();
  };

  /** 
   * Method to update a modified restaurant in the local db;
   */
  updateRestaurant(restaurant) {
    
  }
    
} // class ends here

self.mainhelper = new MainHelper();