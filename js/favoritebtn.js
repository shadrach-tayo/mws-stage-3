class FavoriteBtn {
  constructor(el, restaurant) {
    this.restaurant = restaurant;
    this.el = el;
    this.el.setAttribute('aria-role', 'switch');
    this.is_favorite = this.restaurant.is_favorite;
    this.render();
  }

  render() {
    if(this.is_favorite) {
      this.el.classList.add('is-favorite');
    } else {
      this.el.classList.remove('is-favorite');
    }

    this.el.setAttribute('title', this.is_favorite ? `unfavorite ${this.restaurant.name}` : `favorite ${this.restaurant.name}`);
    this.el.setAttribute('aria-checked', this.is_favorite);
    this.el.setAttribute('aria-label', this.is_favorite ? `unfavorite ${this.restaurant.name}` : `favorite ${this.restaurant.name}`);
    this.setClick(this.el, this.updateFavorite.bind(this));
  }

  toggleFavorite(favorite) {
    this.is_favorite = !favorite;
  }

  setClick(target, callback) {
    target.onclick = callback;
  }

  updateFavorite() {
    this.toggleFavorite(this.is_favorite);
    this.restaurant.is_favorite = this.is_favorite;
    this.render();
    mainhelper.updateRestaurant(this.restaurant);
  }
}