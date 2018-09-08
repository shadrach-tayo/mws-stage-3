 /*
  * Open database
  */
 async function openDatabase() {
  if(!navigator.serviceWorker) return;

  return await idb.open('mws-store', 1, (upgradeDb) => {
   var store = upgradeDb.createObjectStore('mws', {keyPath: "id"});
   console.log(upgradeDb);
   store.createIndex('id', 'id');
  })
}


/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port ---http://localhost:${port}
    return `http://localhost:${port}`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    // get the database instance open a transaction in the
    // 'mws' object store and return all;
    
    // wrap the function in an promise to express asynchrony
    return new Promise((resolve, reject) => {
      this.dbPromise.then(db => {
        let tx = db.transaction('mws');
        let store = tx.objectStore('mws');
        return store.getAll();
      }).then(restaurants => {
        // check if restaurant was found in the database
        // and return other wise fetch from network
        if(restaurants.length > 0) {
          resolve(restaurants);
        } else {
            return fetch(`${DBHelper.DATABASE_URL}/restaurants`,
              {
                method: 'GET'
              }
            ).then(response => response.json())
            .then(restaurants => {
              this.dbPromise.then(db => {
                if(!db) return;
                // open a readwrite transaction and store 
                // restaurants data from the network in the database
                let tx = db.transaction('mws', 'readwrite');
                let store = tx.objectStore('mws');
                let data = restaurants;
                data.forEach(restaurant => store.put(restaurant));
              }).catch(err => {
                reject(err);
              });
              console.log(restaurants);
              resolve(restaurants)
            })
            .catch(err => err);
        }
      });
    });

  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    DBHelper.fetchRestaurants()
    .then(restaurants => {
      const restaurant = restaurants.find(r => r.id == id);
      callback(null, restaurant);
    })
    .catch(err => callback(err));
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants()
    .then(restaurants => {
      // Filter restaurants to have only given cuisine type
      const results = restaurants.filter(r => r.cuisine_type == cuisine);
      callback(null, results);
    })
    .catch(err => callback(err));
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    DBHelper.fetchRestaurants()
    .then(restaurants => {
      // filter restaurants to have only given neighbourhood
      const results = restaurants.filter(r => r.neighborhood == neighborhood);
      callback(null, results);
    }).catch(err => callback(err))
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants()
    .then(restaurants => {
      let results = restaurants
      if (cuisine != 'all') { // filter by cuisine
        results = results.filter(r => r.cuisine_type == cuisine);
      }
      if (neighborhood != 'all') { // filter by neighborhood
        results = results.filter(r => r.neighborhood == neighborhood);
      }
      callback(null, results);
    })
    .catch(err => callback(err));
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants

    DBHelper.fetchRestaurants()
    .then(restaurants => {
      // Get all neigbhourhoods from the restaurants
      const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
      // filter to remove unique neigbhourhoods
      const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
      callback(null, uniqueNeighborhoods);
    }).catch(err => callback(err))
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants()
    .then(restaurants => {
       // Get all cuisines from all restaurants
       const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
       // Remove duplicates from cuisines
       const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
       callback(null, uniqueCuisines);
    })
    .catch(err => callback(err));
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return  restaurant.photograph;
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  } 
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */

}

DBHelper.dbPromise = openDatabase();
// dbPromise.then(db => console.log(db))