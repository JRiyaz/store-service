import { Injectable, signal } from "@angular/core";
import { Product } from "ui-shared";

@Injectable({
  providedIn: "root",
})
export class WishlistService {
  private _items = signal<Product[]>([]);
  items = this._items.asReadonly();

  toggleWishlist(product: Product) {
    const exists = this._items().find((i) => i.id === product.id);
    if (exists) {
      this._items.update((items) => items.filter((i) => i.id !== product.id));
    } else {
      this._items.update((items) => [...items, product]);
    }
  }

  isInWishlist(productId: number) {
    return !!this._items().find((i) => i.id === productId);
  }

  clearWishlist() {
    this._items.set([]);
  }
}
