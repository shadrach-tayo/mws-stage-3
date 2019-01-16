/**
 * class handles Fetch logic for the Restaurant app
 */
const port = 4000;
class RestaurantFetch {
  static get DATABASE_URL() {
    const port = 4000; // Change this to your server port ---http://localhost:${port}
    return `http://localhost:${port}/graphql`;
  }

  static get RESTAURANTS_URL() {
    return `${this.DATABASE_URL}/restaurants/`;
  }

  static RESTAURANT_URL(id) {
    return `${this.DATABASE_URL}/restaurants/${id}`;
  }

  static get REVIEWS_URL() {
    return `${this.DATABASE_URL}/reviews/`;
  }

  static RESTAURANT_REVIEWS_URL(id) {
    return `${this.DATABASE_URL}/reviews/?restaurant_id=${id}`;
  }

  static FAVORITES_URL(id, value) {
    return `http://localhost:1337/restaurants/${id}/?is_favorite=${value}`;
  }

  static get getAllRestaurantsQuery() {
    return `
    query {
      getAllRestaurants {
        id
        name
        address
        cuisine_type
        neighborhood
        is_favorite
        photograph
        latlng {
          lat
          lng
        }
        operating_hours {
          Monday
          Tuesday
          Wednesday
          Thursday
          Friday
          Saturday
          Sunday
        }
        createdAt
        updatedAt
      }
    }
    `;
  }

  static get getRestaurantQuery() {
    return `
    query($id: Int!) {
      getRestaurant(id: $id) {
        id
        name
        address
        cuisine_type
        neighborhood
        is_favorite
        photograph
        latlng {
          lat
          lng
        }
        operating_hours {
          Monday
          Tuesday
          Wednesday
          Thursday
          Friday
          Saturday
          Sunday
        }
        createdAt
        updatedAt
      }
    }
    `;
  }

  static get getReviewsQuery() {
    return `
    query($restaurant_id: Int!) {
      getReviews(restaurant_id: $restaurant_id){
        id
        name
        rating
        comments
        createdAt
        updatedAt
        restaurant_id
      }
    }
    `;
  }

  static get getAllReviewsQuery() {
    return `
    query {
      getAllReviews {
        id
        name
        rating
        comments
        createdAt
        updatedAt
        restaurant_id
      }
    }
    `;
  }

  static getAllRestaurants() {
    const getAllRestaurants = this.client.request(this.getAllRestaurantsQuery);
    return getAllRestaurants.then(res => {
      console.log(res);
      return res.data.getAllRestaurants;
    });
  }

  static getRestaurant(id = 0) {
    const getRestaurant = this.client.request(this.getRestaurantQuery, { id });
    return getRestaurant.then(res => {
      console.log(res);
      return res.data.getRestaurant;
    });
  }

  static getAllReviews() {
    const getAllReviews = this.client.request(this.getAllReviewsQuery);
    return getAllReviews.then(res => {
      console.log(res);
      return res.data.getAllReviews;
    });
  }

  static getReviews(restaurant_id) {
    const getReviews = this.client.request(this.getReviewsQuery, {
      restaurant_id
    });
    return getReviews.then(res => {
      return res.data.getReviews;
    });
  }

  static createReview(review) {
    return fetch(this.REVIEWS_URL, {
      method: "POST",
      body: JSON.stringify(review),
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    }).then(response => response.json());
  }

  static createReviews(reviews) {
    return Promise.all(reviews.map(review => this.createReview(review))).then(
      responses => responses
    );
  }

  static setFavourite(id, value) {
    return fetch(this.FAVORITES_URL(id, value), {
      method: "PUT"
    }).then(res => console.log(res));
  }
}

RestaurantFetch.client = new GraphQLClient(`http://localhost:${port}/graphql`);
