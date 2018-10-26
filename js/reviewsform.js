class ReviewsForm {
  constructor(context, restaurantId, form) {
    this.context = context;
    this.restaurant_id = restaurantId;
    this.form = form;
    this.addReviewButton = document.querySelector('.add-review--button');
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

  hideReviewForm() {
    this.form.classList.add('hidden');
    this.addReviewButton.classList.remove('hidden');
    this.lastActive.focus();
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
    this.setListener(this.addReviewButton, 'click', this.showReviewForm);
  }

  showReviewForm() {
    this.lastActive = document.activeElement;
    this.form.classList.remove('hidden');
    this.addReviewButton.classList.add('hidden');
    this.form.querySelector('input').focus();
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

      // clear the form values 
      this.clear();

      // hide the form in the next frame
      this.hideReviewForm();

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