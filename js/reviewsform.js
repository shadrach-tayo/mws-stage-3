class ReviewsForm {
  constructor(context, restaurantId, form) {
    this.context = context;
    this.restaurant_id = restaurantId;
    this.form = form;
    this.name = document.querySelector('#reviews-name');
    this.rating = document.querySelector('#reviews-rating');
    this.comments = document.querySelector('#reviews-comment');
    this.submitBtn = document.querySelector('#reviews-submit');
    
    // Add listener to form and submit button
    this.setListeners();
  }

  clear() {
    [this.name, this.rating, this.comments].map(node => node.value = "");
  }

  setListener(target, evt, callback) {
    target.addEventListener(evt, (e) => {
      e.preventDefault();
      callback.call(this)
    });
  }

  setListeners() {
    this.setListener(this.form, 'submit', this.submitReview);
    this.setListener(this.submitBtn, 'submit', this.submitReview);
  }

  submitReview() {
    let isValid = this.validateForm();
    if(isValid) {
      const review = {
        "restaurant_id": this.restaurant_id,
        "name": this.name.value,
        "rating": this.rating.value,
        "comments": this.comments.value
      }
      this.clear();
      RestaurantFetch.createReview(review)
      .then(review => {
        this.context.addReview(review);
      })
      .catch(error => {
        const offlineReview = {...review};
        this.context.addReview(offlineReview);
        this.saveReviewOffline(offlineReview);
      });
    }
  }

  saveReviewOffline(review) {
    RestaurantsDb.savePendingReview(review)
  }

  validateForm() {
    if(this.name.value.length > 0 && this.rating.value && this.comments.value.length > 0) {
      return true;
    }
    return false;
  }
}