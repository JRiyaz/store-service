import { Component, inject, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, Router } from "@angular/router";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import {
  CartService,
  AuthStateService,
  InventoryDataService,
  Order,
  NotificationService,
} from "ui-shared";

@Component({
  selector: "app-checkout",
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="shopper-checkout animate-fade-in">
      <header class="checkout-head">
        <h1>Checkout</h1>
        <p>Confirm your shipping and payment details.</p>
      </header>

      <div class="checkout-grid" *ngIf="!success(); else successState">
        <!-- Form Column -->
        <div class="form-column">
          <form [formGroup]="checkoutForm" (ngSubmit)="processPayment()">
            <!-- Section 1: Shipping -->
            <section class="checkout-section shopper-card">
              <div class="section-head">
                <span class="step">1</span>
                <h2>Shipping</h2>
              </div>

              <div class="f-grid">
                <div class="f-group full">
                  <label>Full Name</label>
                  <input
                    type="text"
                    formControlName="fullName"
                    placeholder="Name"
                    [class.err]="isInvalid('fullName')"
                  />
                </div>

                <div class="f-group full">
                  <label>Address</label>
                  <input
                    type="text"
                    formControlName="address"
                    placeholder="123 Street"
                    [class.err]="isInvalid('address')"
                  />
                </div>

                <div class="f-row">
                  <div class="f-group">
                    <label>City</label>
                    <input
                      type="text"
                      formControlName="city"
                      placeholder="City"
                      [class.err]="isInvalid('city')"
                    />
                  </div>
                  <div class="f-group">
                    <label>Country</label>
                    <input
                      type="text"
                      formControlName="country"
                      placeholder="Country"
                      [class.err]="isInvalid('country')"
                    />
                  </div>
                  <div class="f-group">
                    <label>Zip</label>
                    <input
                      type="text"
                      formControlName="postalCode"
                      placeholder="Zip"
                      [class.err]="isInvalid('postalCode')"
                    />
                  </div>
                </div>
              </div>
            </section>

            <!-- Section 2: Payment -->
            <section class="checkout-section shopper-card">
              <div class="section-head">
                <span class="step">2</span>
                <h2>Payment</h2>
              </div>

              <div class="method-selector">
                <label
                  class="m-opt"
                  [class.active]="
                    checkoutForm.get('paymentMethod')?.value === 'card'
                  "
                >
                  <input
                    type="radio"
                    formControlName="paymentMethod"
                    value="card"
                  />
                  Card
                </label>
                <label
                  class="m-opt"
                  [class.active]="
                    checkoutForm.get('paymentMethod')?.value === 'paypal'
                  "
                >
                  <input
                    type="radio"
                    formControlName="paymentMethod"
                    value="paypal"
                  />
                  PayPal
                </label>
              </div>

              <div
                class="card-inputs animate-fade-in"
                *ngIf="checkoutForm.get('paymentMethod')?.value === 'card'"
              >
                <div class="f-group full">
                  <label>Card Number</label>
                  <input
                    type="text"
                    formControlName="cardNumber"
                    placeholder="0000 0000 0000 0000"
                    [class.err]="isInvalid('cardNumber')"
                  />
                </div>
                <div class="f-row-2">
                  <div class="f-group">
                    <label>Expiry</label>
                    <input
                      type="text"
                      formControlName="expiry"
                      placeholder="MM/YY"
                      [class.err]="isInvalid('expiry')"
                    />
                  </div>
                  <div class="f-group">
                    <label>CVC</label>
                    <input
                      type="password"
                      formControlName="cvc"
                      placeholder="***"
                      [class.err]="isInvalid('cvc')"
                    />
                  </div>
                </div>
              </div>
            </section>
          </form>
        </div>

        <!-- Summary Column -->
        <aside class="summary-column">
          <div class="summary-box shopper-card">
            <h3>Order Summary</h3>

            <div class="summary-items">
              <div class="mi-item" *ngFor="let item of cartService.items()">
                <div class="mi-left">
                  <span class="q">{{ item.quantity }}x</span>
                  <span class="n">{{ item.name }}</span>
                </div>
                <span class="p">{{
                  item.price * item.quantity | currency
                }}</span>
              </div>
            </div>

            <div class="summary-breakdown">
              <div class="b-row">
                <span>Subtotal</span
                ><span>{{ cartService.subtotal() | currency }}</span>
              </div>
              <div class="b-row">
                <span>Tax</span><span>{{ cartService.tax() | currency }}</span>
              </div>
              <div class="b-row total">
                <span>Total</span
                ><span class="v">{{ cartService.total() | currency }}</span>
              </div>
            </div>

            <button
              class="btn-confirm"
              (click)="processPayment()"
              [disabled]="
                processing() ||
                checkoutForm.invalid ||
                cartService.items().length === 0
              "
            >
              {{ processing() ? "Processing..." : "Place Order" }}
            </button>

            <div class="security-info">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <p>Secure SSL encrypted transaction.</p>
            </div>
          </div>
        </aside>
      </div>

      <ng-template #successState>
        <div class="shopper-success-card shopper-card animate-fade-in">
          <div class="succ-icon">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10b981"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h2>Order Confirmed</h2>
          <p>
            Order ID: <b>#{{ orderId() }}</b
            >. We've sent a confirmation email.
          </p>
          <div class="succ-actions">
            <button
              class="btn-confirm !w-auto !px-10"
              routerLink="/store/orders"
            >
              View Orders
            </button>
            <button class="btn-secondary !w-auto !px-10" routerLink="/store">
              Back to Store
            </button>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [
    `
      .shopper-checkout {
        display: flex;
        flex-direction: column;
        gap: 2.5rem;
        max-width: 1000px;
        margin: 0 auto;
      }

      .checkout-head h1 {
        font-size: 1.75rem;
        font-weight: 800;
        margin: 0;
        color: var(--text);
        letter-spacing: -0.02em;
      }
      .checkout-head p {
        font-size: 0.85rem;
        color: var(--text-muted);
        margin-top: 0.25rem;
      }

      .checkout-grid {
        display: grid;
        grid-template-columns: 1fr 340px;
        gap: 3rem;
        align-items: start;
      }

      .shopper-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 1.25rem;
        padding: 1.75rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
      }

      .checkout-section {
        margin-bottom: 1.5rem;
      }
      .section-head {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
      }
      .step {
        width: 24px;
        height: 24px;
        background: var(--primary);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        font-size: 0.7rem;
      }
      .section-head h2 {
        font-size: 1rem;
        font-weight: 800;
        margin: 0;
        color: var(--text);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .f-grid {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .f-group {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }
      .f-group label {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
      }
      .f-group input {
        background: var(--bg);
        border: 1.5px solid var(--border);
        padding: 0.65rem 0.85rem;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text);
        outline: none;
        transition: border-color 0.2s;
      }
      .f-group input:focus {
        border-color: var(--primary);
      }
      .f-group input.err {
        border-color: #ef4444;
      }

      .f-row {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 0.75rem;
      }
      .f-row-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
      }

      .method-selector {
        display: flex;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
      }
      .m-opt {
        flex: 1;
        padding: 0.85rem;
        background: var(--bg);
        border: 1.5px solid var(--border);
        border-radius: 10px;
        text-align: center;
        cursor: pointer;
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--text-muted);
        transition: all 0.2s;
      }
      .m-opt input {
        display: none;
      }
      .m-opt.active {
        border-color: var(--primary);
        color: var(--primary);
        background: var(--surface);
      }

      .card-inputs {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .summary-box {
        position: sticky;
        top: 100px;
      }
      .summary-box h3 {
        font-size: 1rem;
        font-weight: 800;
        margin-bottom: 1.5rem;
        color: var(--text);
      }

      .summary-items {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
      }
      .mi-item {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--text-muted);
      }
      .mi-left {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
        overflow: hidden;
      }
      .mi-left .q {
        color: var(--primary);
        font-weight: 800;
      }
      .mi-left .n {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .mi-item .p {
        color: var(--text);
        font-weight: 700;
      }

      .summary-breakdown {
        border-top: 1px dashed var(--border);
        padding-top: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
      }
      .b-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-muted);
      }
      .b-row.total {
        border-top: 1px solid var(--border);
        padding-top: 1rem;
        color: var(--text);
      }
      .b-row.total .v {
        font-size: 1.75rem;
        font-weight: 900;
        color: var(--primary);
        letter-spacing: -0.02em;
      }

      .btn-confirm {
        width: 100%;
        background: var(--primary);
        color: white;
        border: none;
        padding: 0.85rem;
        border-radius: 10px;
        font-size: 0.9rem;
        font-weight: 800;
        cursor: pointer;
        transition: background 0.2s;
      }
      .btn-confirm:hover:not(:disabled) {
        transform: translateY(-1px);
      }
      .btn-confirm:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .security-info {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        margin-top: 1.25rem;
        padding: 0.75rem;
        background: var(--bg);
        border-radius: 8px;
        color: var(--text-muted);
      }
      .security-info p {
        font-size: 0.7rem;
        font-weight: 600;
        line-height: 1.2;
        margin: 0;
      }

      .shopper-success-card {
        padding: 5rem 2rem;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
      }
      .shopper-success-card h2 {
        font-size: 1.75rem;
        font-weight: 800;
        color: var(--text);
        margin: 0;
      }
      .succ-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
      }
      .btn-secondary {
        background: var(--bg);
        border: 1.5px solid var(--border);
        color: var(--text);
        padding: 0.85rem;
        border-radius: 10px;
        font-weight: 800;
        cursor: pointer;
        font-size: 0.9rem;
      }

      @media (max-width: 900px) {
        .checkout-grid {
          grid-template-columns: 1fr;
        }
        .summary-column {
          width: 100%;
        }
      }
    `,
  ],
})
export class CheckoutComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private notify = inject(NotificationService);
  cartService = inject(CartService);
  authService = inject(AuthStateService);
  private inventoryService = inject(InventoryDataService);

  processing = signal(false);
  success = signal(false);
  orderId = signal("");

  checkoutForm: FormGroup = this.fb.group({
    fullName: [this.authService.user()?.name || "", Validators.required],
    address: ["", Validators.required],
    city: ["", Validators.required],
    country: ["", Validators.required],
    postalCode: ["", Validators.required],
    paymentMethod: ["card", Validators.required],
    cardNumber: ["", [Validators.required, Validators.pattern("^[0-9]{16}$")]],
    expiry: [
      "",
      [Validators.required, Validators.pattern("^[0-9]{2}/[0-9]{2}$")],
    ],
    cvc: ["", [Validators.required, Validators.pattern("^[0-9]{3,4}$")]],
  });

  isInvalid(controlName: string) {
    const control = this.checkoutForm.get(controlName);
    return control ? control.invalid && control.touched : false;
  }

  processPayment() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }
    this.processing.set(true);
    setTimeout(() => {
      const id = "ORD-" + Math.floor(Math.random() * 90000 + 10000);
      const newOrder: Order = {
        id,
        customer: this.authService.user()?.name || "Guest",
        status: "Pending",
        amount: this.cartService.total(),
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
    }, 1000);
  }
}
