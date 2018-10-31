class ReviewsForm {
  constructor(context, restaurantId, formContainer) {
    this.context = context;
    this.restaurant_id = restaurantId;
    this.formContainer = formContainer;
    this.form = formContainer.querySelector('#reviews-form');
    this.addReviewButton = document.querySelector('.add-review--button');
    this.name = document.querySelector('#reviews-name');
    this.rating = document.querySelector('#reviews-rating');
    this.comments = document.querySelector('#reviews-comment');
    this.submitBtn = document.querySelector('#reviews-submit');
    this.closeBtn = document.querySelector('#js-close-btn');
    
    // form animation keys
    this.formAnimationKeys = [
      {display: 'none', transform: 'scale(1)', opacity: '0'},
      {display: 'block', transform: 'scale(.5)', opacity: '0'},
      {display: 'block', transform: 'scale(1)', opacity: '1', easing: 'cubic-bezier(.35,.97,.13,1.14)'}
    ];
    
    // create form animation and pause it
    this.formAnimation = this.form.animate(
      this.formAnimationKeys,
      {duration: 300}
    );
    this.formAnimation.pause();
    this.setListener(this.addReviewButton, 'click', this.showReviewForm);
    
    // Add listener to form and submit button
  }
  
  clear() {
    [this.name, this.rating, this.comments].map(node => node.value = "");
  }
  
  hideReviewForm() {
    this.addReviewButton.classList.remove('hidden');  
    this.formAnimation.playblackRate = -1;
    this.formAnimation.play();
    this.lastActive.focus();
    setTimeout(() => {
      this.formContainer.classList.add('hidden');
    }, 150);
    this.removeListeners();
  }
  
  setListener(target, evt, callback) {
    target.addEventListener(evt, (e) => {
      e.preventDefault();
      callback.call(this)
    }, false);
  }

  removeListener(target, evt, callback) {
    target.removeEventListener(evt, callback);
  }
  
  setListeners() {
    this.setListener(this.form, 'submit', this.submitReview);
    this.setListener(this.submitBtn, 'submit', this.submitReview);
    this.setListener(this.closeBtn, 'click', this.hideReviewForm);
  }
  
  removeListeners() {
    this.removeListener(this.form, 'submit', this.submitReview);
    this.removeListener(this.submitBtn, 'submit', this.submitReview);
    this.removeListener(this.closeBtn, 'click', this.hideReviewForm);
  }
  
  showReviewForm() {
    this.setListeners();
    this.lastActive = document.activeElement;
    this.formContainer.classList.remove('hidden');
    this.addReviewButton.classList.add('hidden');
    this.formAnimation.playblackRate = 1;
    this.formAnimation.play();
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
        console.log(error);
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