import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, Router } from "@angular/router";
import {
  CartService,
  AuthStateService,
  InventoryDataService,
  Order,
} from "ui-shared";

@Component({
  selector: "app-checkout",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="checkout-container">
      <h1>Checkout</h1>

      <div class="checkout-layout" *ngIf="!success()">
        <div class="checkout-form">
          <section class="checkout-section">
            <h2>Shipping Information</h2>
            <div class="form-grid">
              <div class="form-group full">
                <label>Full Name</label>
                <input
                  type="text"
                  [value]="authService.user()?.name"
                  placeholder="John Doe"
                />
              </div>
              <div class="form-group">
                <label>Address</label>
                <input type="text" placeholder="123 Industrial Way" />
              </div>
              <div class="form-group">
                <label>City</label>
                <input type="text" placeholder="Berlin" />
              </div>
              <div class="form-group">
                <label>Country</label>
                <input type="text" placeholder="Germany" />
              </div>
              <div class="form-group">
                <label>Postal Code</label>
                <input type="text" placeholder="10115" />
              </div>
            </div>
          </section>

          <section class="checkout-section">
            <h2>Payment Method</h2>
            <div class="payment-options">
              <label class="payment-option">
                <input type="radio" name="payment" checked />
                <span class="option-content">
                  <span class="icon">💳</span>
                  <span>Credit Card</span>
                </span>
              </label>
              <label class="payment-option">
                <input type="radio" name="payment" />
                <span class="option-content">
                  <span class="icon">🅿️</span>
                  <span>PayPal</span>
                </span>
              </label>
            </div>

            <div class="card-details">
              <div class="form-group full">
                <label>Card Number</label>
                <input type="text" placeholder="0000 0000 0000 0000" />
              </div>
              <div class="form-group">
                <label>Expiry Date</label>
                <input type="text" placeholder="MM/YY" />
              </div>
              <div class="form-group">
                <label>CVC</label>
                <input type="password" placeholder="***" />
              </div>
            </div>
          </section>
        </div>

        <div class="order-preview">
          <h2>Order Preview</h2>
          <div class="preview-items">
            <div class="preview-item" *ngFor="let item of cartService.items()">
              <span>{{ item.quantity }}x {{ item.name }}</span>
              <span>{{ item.price * item.quantity | currency }}</span>
            </div>
          </div>
          <div class="summary">
            <div class="row">
              <span>Subtotal</span>
              <span>{{ cartService.subtotal() | currency }}</span>
            </div>
            <div class="row">
              <span>Tax</span>
              <span>{{ cartService.tax() | currency }}</span>
            </div>
            <div class="row total">
              <span>Total</span>
              <span>{{ cartService.total() | currency }}</span>
            </div>
          </div>
          <button
            class="pay-btn"
            (click)="processPayment()"
            [disabled]="processing()"
          >
            {{
              processing()
                ? "Processing..."
                : "Pay " + (cartService.total() | currency)
            }}
          </button>
        </div>
      </div>

      <div class="success-state" *ngIf="success()">
        <div class="success-icon">✅</div>
        <h2>Order Confirmed!</h2>
        <p>
          Thank you for your purchase. Your order
          <strong>{{ orderId() }}</strong> has been placed.
        </p>
        <div class="success-actions">
          <button class="track-btn" routerLink="/store/orders">
            Track Order
          </button>
          <button class="home-btn" routerLink="/store">Back to Store</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .checkout-container {
        max-width: 1000px;
        margin: 0 auto;
      }

      h1 {
        margin-bottom: 2rem;
      }

      .checkout-layout {
        display: grid;
        grid-template-columns: 1fr 350px;
        gap: 3rem;
      }

      .checkout-section {
        background: var(--bg-card, #ffffff);
        padding: 2rem;
        border-radius: 1rem;
        border: 1px solid var(--border-color, #e2e8f0);
        margin-bottom: 2rem;
      }

      .checkout-section h2 {
        font-size: 1.25rem;
        margin-bottom: 1.5rem;
        border-bottom: 1px solid var(--border-color, #e2e8f0);
        padding-bottom: 0.5rem;
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
      }

      .form-group.full {
        grid-column: span 2;
      }

      .form-group label {
        display: block;
        font-size: 0.875rem;
        font-weight: 500;
        margin-bottom: 0.5rem;
        color: var(--text-muted);
      }

      .form-group input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 0.5rem;
        background: var(--bg-main);
        color: var(--text-main);
        outline: none;
      }

      .form-group input:focus {
        border-color: #3b82f6;
      }

      .payment-options {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .payment-option {
        flex: 1;
        cursor: pointer;
      }

      .payment-option input {
        display: none;
      }

      .option-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1rem;
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 0.75rem;
        gap: 0.5rem;
        transition: all 0.2s;
      }

      .payment-option input:checked + .option-content {
        border-color: #3b82f6;
        background: #eff6ff;
        color: #3b82f6;
      }

      .card-details {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
      }

      .order-preview {
        background: var(--bg-card, #ffffff);
        padding: 2rem;
        border-radius: 1rem;
        border: 1px solid var(--border-color, #e2e8f0);
        height: fit-content;
        position: sticky;
        top: 100px;
      }

      .preview-items {
        margin-bottom: 1.5rem;
        font-size: 0.9rem;
      }

      .preview-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        color: var(--text-muted);
      }

      .summary {
        border-top: 1px solid var(--border-color, #e2e8f0);
        padding-top: 1.5rem;
        margin-bottom: 2rem;
      }

      .row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.75rem;
      }

      .row.total {
        font-weight: 700;
        font-size: 1.25rem;
        color: var(--text-main);
      }

      .pay-btn {
        width: 100%;
        background: #10b981;
        color: white;
        border: none;
        padding: 1rem;
        border-radius: 0.5rem;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.2s;
      }

      .pay-btn:hover {
        background: #059669;
      }
      .pay-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      .success-state {
        text-align: center;
        padding: 4rem 2rem;
        background: var(--bg-card);
        border-radius: 1.5rem;
        border: 1px solid var(--border-color);
      }

      .success-icon {
        font-size: 5rem;
        margin-bottom: 1.5rem;
      }
      .success-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 2rem;
      }

      .track-btn {
        background: #3b82f6;
        color: white;
        border: none;
        padding: 0.75rem 2rem;
        border-radius: 0.5rem;
        font-weight: 600;
        cursor: pointer;
      }

      .home-btn {
        background: none;
        border: 1px solid var(--border-color);
        color: var(--text-main);
        padding: 0.75rem 2rem;
        border-radius: 0.5rem;
        font-weight: 600;
        cursor: pointer;
      }

      @media (max-width: 850px) {
        .checkout-layout {
          grid-template-columns: 1fr;
        }
        .order-preview {
          position: static;
        }
      }
    `,
  ],
})
export class CheckoutComponent {
  cartService = inject(CartService);
  authService = inject(AuthStateService);
  private inventoryService = inject(InventoryDataService);
  private router = inject(Router);

  processing = signal(false);
  success = signal(false);
  orderId = signal("");

  processPayment() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(["/user/login"]);
      return;
    }

    this.processing.set(true);

    // Simulate API delay
    setTimeout(() => {
      const id = "ORD-" + Math.floor(Math.random() * 9000 + 1000);
      const newOrder: Order = {
        id,
        customer: this.authService.user()?.name || "Guest",
        customerName: this.authService.user()?.name,
        status: "Pending",
        amount: this.cartService.total(),
        totalAmount: this.cartService.total(),
        date: new Date().toISOString().split("T")[0],
        priority: false,
        items: this.cartService.items().map((item) => ({
          productId: item.id,
          name: item.name,
          qty: item.quantity,
          price: item.price,
        })),
      };

      this.inventoryService.addOrder(newOrder);
      this.orderId.set(id);
      this.success.set(true);
      this.processing.set(false);
      this.cartService.clearCart();
    }, 2000);
  }
}
