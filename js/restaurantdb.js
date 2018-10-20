/**
 * Common database helper functions.
 */
class RestaurantsDb {
  static get DBNAME() {
    return 'restaurants-store';
  }

  static get RESTAURANTS_STORE() {
    return 'restaurants';
  }

  static get REVIEWS_STORE() {
    return 'reviews';
  }

  static get ID_INDEX() {
    return 'id';
  }

  static get REVIEWS_INDEX() {
    return 'restaurant_id';
  }

  /*
  * Method to open Database
  */
  static openDatabase() {
    if(!navigator.serviceWorker) {
      console.warn('[service-worker] is not supported in this browser');
      return;
    }
    return idb.open(this.DBNAME, 1, (upgradeDb) => {
      if(!upgradeDb.objectStoreNames.contains(this.RESTAURANTS_STORE)) {
        const store = upgradeDb.createObjectStore(this.RESTAURANTS_STORE, {keyPath: this.ID_INDEX});
        store.createIndex(this.ID_INDEX, this.ID_INDEX);
      }

      if(!upgradeDb.objectStoreNames.contains(this.REVIEWS_STORE)) {
        const objs = upgradeDb.createObjectStore(this.REVIEWS_STORE, {keyPath: this.ID_INDEX});
        objs.createIndex(this.ID_INDEX, this.REVIEWS_INDEX);
      }
    });
    
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants() {
    // get the database instance and open a transaction in the
    // this.RESTAURANTS_STORE object store and return all;
    // first attempt to fetch from database
    // if not successfull, try fetch from the network
    return this.dbPromise.then(db => {
      let tx = db.transaction(this.RESTAURANTS_STORE);
      let store = tx.objectStore(this.RESTAURANTS_STORE);
      return store.getAll();
    }).then(response => {
      if(response.length > 0) return response;
      return RestaurantFetch.fetchRestaurants();
    }).then(response => {
      this.addRestaurantsToDb(response);
      return response;
    })
    .catch(err => console.error(err));
  }

  /**
   * Fetch a single restaurant by id
  */
  static fetchRestaurant(id = 0) {
    return this.dbPromise.then(async db => {
      const store = db.transaction(this.RESTAURANTS_STORE).objectStore(this.RESTAURANTS_STORE)
      const idIndex = store.index('id');
      // +id --> coerce the value of id to type Number if it's a string
      return idIndex.get(+id);
    });
  }

  /**
   * Method to get all restaurants the database
   */

   static fetchRestaurantsFromDb() {
    return this.dbPromise.then(async db => {
      let tx = db.transaction(this.RESTAURANTS_STORE);
      let store = tx.objectStore(this.RESTAURANTS_STORE);
      return store.getAll();
    })
   }


   /**
    * Method to Add restaurants to Database
    */
   static addRestaurantsToDb(restaurants) {
     this.dbPromise.then(async db => {
       let tx = db.transaction(this.RESTAURANTS_STORE, 'readwrite');
       let store = tx.objectStore(this.RESTAURANTS_STORE);
       await restaurants.forEach(res => store.put(res))
       return tx.complete;
     })
   }

  /**
   * Fetch a restaurant by its ID.
   * TODO: change to query data from database by id 
   */
  static fetchRestaurantById(id) {
    return this.fetchRestaurant(id)
    .then(restaurant => {
      if(restaurant !== undefined) {
        console.log('fetched from db by id')
        return restaurant;
      } else {
        return RestaurantFetch.fetchRestaurant(id);
      }
    }).catch(err => console.log(err))
    
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine) {
    console.log('fetch restaurant by cuisine called');
    // Fetch all restaurants  with proper error handling
    this.fetchRestaurants()
    .then(restaurants => {
      // Filter restaurants to have only given cuisine type
      const results = restaurants.filter(r => r.cuisine_type == cuisine);
      debugger;
      callback(null, results);
    })
    .catch(err => err);
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood) {
    console.log('fetching restaurant by neighbourhood called');
    return this.fetchRestaurants()
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
    return this.fetchRestaurants()
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
    return this.fetchRestaurants()
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
    return this.fetchRestaurants()
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
   * Fetch review from database
   * @param {string} id 
   */
  static fetchReviews(id) {
    return this.dbPromise.then(db => {
      return db.transaction(this.REVIEWS_STORE)
        .objectStore(this.REVIEWS_STORE)
        .index(this.ID_INDEX)
        .getAll(+id)
    }).then(reviews => {
      console.log(reviews);
      if(reviews === undefined || reviews.length === 0)
        return this.fetchReviewsFromNetwork(id);
      return reviews
    })
  }

  /**
   * Fetch review from network
   * @param {string} id s
   */
  static fetchReviewsFromNetwork(id) {
    return RestaurantFetch.fetchReviews(id)
      .then(reviews => {
        this.saveReviews(reviews);
        return reviews;
      }).catch(err => console.log('fetch review failed: ', err));
  }

  static saveReviews(reviews) {
    this.dbPromise.then(db => {
      let store = db.transaction(this.REVIEWS_STORE, 'readwrite')
        .objectStore(this.REVIEWS_STORE)
        reviews.forEach(review => store.put(review))
    })
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
      url: this.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  }

  static updateRestaurant(restaurant) {
    console.log(this.dbPromise);
    return this.dbPromise.then(db => {
      db.transaction(this.RESTAURANTS_STORE, 'readwrite')
        .objectStore(this.RESTAURANTS_STORE)
        .put(restaurant);
    })
  }

}

RestaurantsDb.dbPromise = RestaurantsDb.openDatabase();