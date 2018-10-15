/**
 * class handles Fetch logic for the Restaurant app
 */
class RestaurantFetch {
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port ---http://localhost:${port}
    return `http://localhost:${port}`;
  }

  static get RESTAURANTS_URL() {
    return `${this.DATABASE_URL}/restaurants/`;
  }

  static fetchRestaurants() {
    return fetch(this.RESTAURANTS_URL)
            .then(response => response.json())
  }

  static fetchRestaurant(id = 0) {
    let restaurantUrl = `${this.RESTAURANTS_URL}${id}`;
    return fetch(restaurantUrl)
      .then(response => response.json());
  }
}