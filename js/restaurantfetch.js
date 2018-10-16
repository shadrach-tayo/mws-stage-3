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

  static RESTAURANT_URL(id) {
    return `${this.DATABASE_URL}/restaurants/${id}`
  }

  static get REVIEWS_URL() {
    return `${this.DATABASE_URL}/reviews/`;
  }

  static REVIEW_URL(id) {
    return `${this.DATABASE_URL}/reviews/?restaurant_id=${id}`;
  }

  static fetchRestaurants() {
    return fetch(this.RESTAURANTS_URL)
            .then(response => response.json())
  }

  static fetchRestaurant(id = 0) {
    return fetch(this.RESTAURANT_URL(id))
      .then(response => response.json());
  }

  static fetchReviews() {
    return fetch(this.REVIEWS_URL())
      .then(response => response.json());
  }

  static fetchReview(id) {
    return fetch(this.REVIEW_URL(id))
      .then(response => response.json());
  }
}