import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { CartService, CartItem } from "ui-shared";

@Component({
  selector: "app-cart",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="cart-container">
      <h1>Your Shopping Cart</h1>

      <div
        class="cart-layout"
        *ngIf="cartService.items().length > 0; else emptyCart"
      >
        <div class="cart-items">
          <div class="cart-item" *ngFor="let item of cartService.items()">
            <div class="item-image">📦</div>
            <div class="item-details">
              <h3>{{ item.name }}</h3>
              <p class="category">{{ item.category }}</p>
              <button
                class="remove-btn"
                (click)="cartService.removeFromCart(item.id)"
              >
                Remove
              </button>
            </div>
            <div class="item-quantity">
              <div class="qty-controls">
                <button
                  (click)="
                    cartService.updateQuantity(item.id, item.quantity - 1)
                  "
                >
                  -
                </button>
                <span>{{ item.quantity }}</span>
                <button
                  (click)="
                    cartService.updateQuantity(item.id, item.quantity + 1)
                  "
                >
                  +
                </button>
              </div>
            </div>
            <div class="item-price">
              {{ item.price * item.quantity | currency }}
            </div>
          </div>
        </div>

        <div class="cart-summary">
          <h2>Order Summary</h2>
          <div class="summary-row">
            <span>Subtotal</span>
            <span>{{ cartService.subtotal() | currency }}</span>
          </div>
          <div class="summary-row">
            <span>Tax (15%)</span>
            <span>{{ cartService.tax() | currency }}</span>
          </div>
          <div class="summary-row total">
            <span>Total</span>
            <span>{{ cartService.total() | currency }}</span>
          </div>
          <button class="checkout-btn" routerLink="/store/checkout">
            Proceed to Checkout
          </button>
          <p class="shipping-note">
            Free shipping on all industrial orders over $500.
          </p>
        </div>
      </div>

      <ng-template #emptyCart>
        <div class="empty-state">
          <div class="empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Browse our products and add something to your cart!</p>
          <button class="shop-btn" routerLink="/store">Start Shopping</button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [
    `
      .cart-container {
        max-width: 1200px;
        margin: 0 auto;
      }

      h1 {
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 2rem;
      }

      .cart-layout {
        display: grid;
        grid-template-columns: 1fr 350px;
        gap: 2rem;
      }

      .cart-items {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .cart-item {
        display: grid;
        grid-template-columns: 80px 1fr auto 120px;
        gap: 1.5rem;
        padding: 1.5rem;
        background: var(--bg-card, #ffffff);
        border-radius: 1rem;
        border: 1px solid var(--border-color, #e2e8f0);
        align-items: center;
      }

      .item-image {
        width: 80px;
        height: 80px;
        background: #f1f5f9;
        border-radius: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
      }

      .item-details h3 {
        font-size: 1.125rem;
        margin-bottom: 0.25rem;
      }

      .category {
        font-size: 0.875rem;
        color: var(--text-muted);
        margin-bottom: 0.5rem;
      }

      .remove-btn {
        background: none;
        border: none;
        color: #ef4444;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        padding: 0;
      }

      .qty-controls {
        display: flex;
        align-items: center;
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 0.5rem;
        overflow: hidden;
      }

      .qty-controls button {
        padding: 0.25rem 0.75rem;
        background: none;
        border: none;
        color: var(--text-main);
        cursor: pointer;
      }

      .qty-controls button:hover {
        background: var(--bg-main);
      }

      .qty-controls span {
        padding: 0 0.75rem;
        font-weight: 600;
        min-width: 40px;
        text-align: center;
      }

      .item-price {
        text-align: right;
        font-weight: 700;
        font-size: 1.125rem;
      }

      .cart-summary {
        background: var(--bg-card, #ffffff);
        border-radius: 1rem;
        border: 1px solid var(--border-color, #e2e8f0);
        padding: 2rem;
        height: fit-content;
        position: sticky;
        top: 100px;
      }

      .cart-summary h2 {
        font-size: 1.25rem;
        margin-bottom: 1.5rem;
      }

      .summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1rem;
        color: var(--text-muted);
      }

      .summary-row.total {
        border-top: 1px solid var(--border-color, #e2e8f0);
        padding-top: 1rem;
        margin-top: 1rem;
        color: var(--text-main);
        font-weight: 700;
        font-size: 1.25rem;
      }

      .checkout-btn {
        width: 100%;
        background: #3b82f6;
        color: white;
        border: none;
        padding: 1rem;
        border-radius: 0.5rem;
        font-weight: 600;
        font-size: 1rem;
        margin-top: 1.5rem;
        cursor: pointer;
        transition: background 0.2s;
      }

      .checkout-btn:hover {
        background: #2563eb;
      }

      .shipping-note {
        font-size: 0.75rem;
        color: var(--text-muted);
        text-align: center;
        margin-top: 1rem;
      }

      .empty-state {
        text-align: center;
        padding: 4rem 0;
      }

      .empty-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
      }

      .shop-btn {
        background: #3b82f6;
        color: white;
        border: none;
        padding: 0.75rem 2rem;
        border-radius: 0.5rem;
        font-weight: 600;
        margin-top: 2rem;
        cursor: pointer;
      }

      @media (max-width: 992px) {
        .cart-layout {
          grid-template-columns: 1fr;
        }
        .cart-summary {
          position: static;
        }
      }

      @media (max-width: 640px) {
        .cart-item {
          grid-template-columns: 60px 1fr;
          grid-template-areas:
            "img details"
            "img qty"
            "img price";
        }
        .item-image {
          grid-area: img;
        }
        .item-details {
          grid-area: details;
        }
        .item-quantity {
          grid-area: qty;
        }
        .item-price {
          grid-area: price;
          text-align: left;
        }
      }
    `,
  ],
})
export class CartComponent {
  cartService = inject(CartService);
}
