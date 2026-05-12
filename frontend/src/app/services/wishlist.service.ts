import { Injectable, inject, signal } from '@angular/core';
import { NotificationService, type Product } from 'ui-shared';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private _items = signal<Product[]>([]);
  private notify = inject(NotificationService);
  items = this._items.asReadonly();

  toggleWishlist(product: Product) {
    const exists = this._items().find((i) => i.id === product.id);
    if (exists) {
      this._items.update((items) => items.filter((i) => i.id !== product.id));
      this.notify.info('Wishlist', `${product.name} removed from favorites.`);
    } else {
      this._items.update((items) => [...items, product]);
      this.notify.success('Saved!', `${product.name} added to your wishlist.`);
    }
  }

  isInWishlist(productId: number) {
    return !!this._items().find((i) => i.id === productId);
  }

  clearWishlist() {
    this._items.set([]);
  }
}
