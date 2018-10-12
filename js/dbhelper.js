/**
 * Common database helper functions.
 */
class DBHelper {

  /*
  * Open database
  */
  static openDatabase() {
    if(!navigator.serviceWorker) {
      console.warn('[service-worker] is not supported in this browser');
      return;
    }
    return idb.open('mws-store', 1, (upgradeDb) => {
      var store = upgradeDb.createObjectStore('mws', {keyPath: "id"});
      console.log(upgradeDb);
      store.createIndex('id', 'id');
    });
    
  }
  
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
  static fetchRestaurants() {
    // get the database instance and open a transaction in the
    // 'mws' object store and return all;
    
    // wrap the function in an promise to express asynchrony
    return new Promise((resolve, reject) => {
      // first attempt to fetch from database
      this.fetchRestaurantsFromDb()
      .then(restaurants => {
        // check if restaurant was found in the database
        // and return otherwise fetch from network
        if(restaurants.length > 0) {
          console.log('found in database');
          resolve(restaurants);
        } else {
            return fetch(`${DBHelper.DATABASE_URL}/restaurants`,
              {
                method: 'GET'
              }
            ).then(response => response.json())
            .then(async restaurants => {
              // add restaurants data to database
              await this.addRestaurantsToDb(restaurants)
              resolve(restaurants)
            })
            .catch(err => reject(err));
        }
      });
    });
  }

  /**
   * Method to get all restaurants the database
   */

   static fetchRestaurantsFromDb() {
    return this.dbPromise.then(async db => {
      let tx = db.transaction('mws');
      let store = tx.objectStore('mws');
      return store.getAll();
    })
   }

  /**
   * Method to get restaurant from database by Id: INCOMPLETE
   */
  static fetchRestaurantFromDbById(id) {
    return this.dbPromise.then(async db => {
      const store = db.transaction('mws').objectStore('mws')
      const idIndex = store.index('id');
      // +id --> coerce the value of id to type Number if it's a string
      return idIndex.get(+id);
    });
  }


   /**
    * Method to Add restaurants to Database
    */
   static addRestaurantsToDb(restaurants) {
     this.dbPromise.then(async db => {
       let tx = db.transaction('mws', 'readwrite');
       let store = tx.objectStore('mws');
       await restaurants.forEach(res => store.put(res))
       return tx.complete;
     })
   }

  /**
   * Fetch a restaurant by its ID.
   * TODO: change to query data from database by id 
   */
  static fetchRestaurantById(id) {
    return DBHelper.fetchRestaurantFromDbById(id)
    .then(restaurant => {
      if(restaurant !== undefined) {
        console.log('fetched from db by id')
        return restaurant;
      } else {
        return this.fetchRestaurants().then(restaurants => {
          console.log(restaurants);
          console.log('fetched from network')
          return restaurants.filter(r => r.id == id)[0];
        })
      }
    }).catch(err => console.log(err))
    
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine) {
    console.log('fetch restaurant by cuisine called');
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants()
    .then(restaurants => {
      // Filter restaurants to have only given cuisine type
      const results = restaurants.filter(r => r.cuisine_type == cuisine);
      callback(null, results);
    })
    .catch(err => err);
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood) {
    console.log('fetching restaurant by neighbourhood called');
    return DBHelper.fetchRestaurants()
    .then(restaurants => {
      // filter restaurants to have only given neighbourhood
      const results = restaurants.filter(r => r.neighborhood == neighborhood);
      return results;
    }).catch(err => err);
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood) {
    // Fetch all restaurants
    return DBHelper.fetchRestaurants()
    .then(restaurants => {
      let results = restaurants
      if (cuisine != 'all') { // filter by cuisine
        results = results.filter(r => r.cuisine_type == cuisine);
      }
      if (neighborhood != 'all') { // filter by neighborhood
        results = results.filter(r => r.neighborhood == neighborhood);
      }
      return results;
    })
    .catch(err => err);
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods() {
    // Fetch all restaurants
    return DBHelper.fetchRestaurants()
    .then(restaurants => {
      // Get all neigbhourhoods from the restaurants
      const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
      // filter to remove unique neigbhourhoods
      const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
      return uniqueNeighborhoods;
    }).catch(err => console.error(err," : couldn't fetch neighbourhoods"));
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines() {
    // Fetch all restaurants
    return DBHelper.fetchRestaurants()
    .then(restaurants => {
       // Get all cuisines from all restaurants
       const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
       // Remove duplicates from cuisines
       const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
       return uniqueCuisines;
    })
    .catch(err => err);
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
   static mapMarkerForRestaurant(restaurant, newMap) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  } 

}

DBHelper.dbPromise = DBHelper.openDatabase();