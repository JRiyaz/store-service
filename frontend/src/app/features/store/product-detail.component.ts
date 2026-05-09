import { Component, inject, signal, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, ActivatedRoute } from "@angular/router";
import { InventoryDataService, CartService, Product } from "ui-shared";

@Component({
  selector: "app-product-detail",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="product-detail-container" *ngIf="product()">
      <nav class="breadcrumb">
        <a routerLink="/store">Store</a>
        <span>/</span>
        <a
          [routerLink]="['/store']"
          [queryParams]="{ category: product()?.category }"
          >{{ product()?.category }}</a
        >
        <span>/</span>
        <span class="current">{{ product()?.name }}</span>
      </nav>

      <div class="product-layout">
        <div class="product-gallery">
          <div class="main-image">
            <span class="gallery-placeholder">📦</span>
          </div>
        </div>

        <div class="product-main-info">
          <span class="badge">{{ product()?.category }}</span>
          <h1>{{ product()?.name }}</h1>
          <p class="price">{{ product()?.price | currency }}</p>

          <div class="description-section">
            <h3>Description</h3>
            <p>{{ product()?.description }}</p>
          </div>

          <div
            class="stock-info"
            [class.low-stock]="(product()?.stock || 0) < 10"
          >
            <span class="stock-status">
              {{ (product()?.stock || 0) > 0 ? "In Stock" : "Out of Stock" }}
            </span>
            <span class="stock-count"
              >({{ product()?.stock }} units available)</span
            >
          </div>

          <div class="purchase-actions" *ngIf="(product()?.stock || 0) > 0">
            <div class="quantity-selector">
              <button (click)="decrementQty()">-</button>
              <span>{{ quantity() }}</span>
              <button (click)="incrementQty()">+</button>
            </div>
            <button class="add-to-cart-btn" (click)="addToCart()">
              Add to Cart
            </button>
          </div>

          <div class="features-grid">
            <div class="feature">
              <span class="icon">🚚</span>
              <div>
                <strong>Free Delivery</strong>
                <p>On orders over $500</p>
              </div>
            </div>
            <div class="feature">
              <span class="icon">🛡️</span>
              <div>
                <strong>2 Year Warranty</strong>
                <p>Industrial standard</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="not-found" *ngIf="!product() && !loading()">
      <h2>Product Not Found</h2>
      <button routerLink="/store">Return to Store</button>
    </div>
  `,
  styles: [
    `
      .product-detail-container {
        max-width: 1200px;
        margin: 0 auto;
      }

      .breadcrumb {
        display: flex;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: var(--text-muted);
        margin-bottom: 2rem;
      }

      .breadcrumb a {
        color: inherit;
        text-decoration: none;
      }

      .breadcrumb a:hover {
        color: #3b82f6;
      }

      .breadcrumb .current {
        color: var(--text-main);
        font-weight: 500;
      }

      .product-layout {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4rem;
      }

      .main-image {
        background: #f1f5f9;
        aspect-ratio: 1;
        border-radius: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 8rem;
      }

      .badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        background: #eff6ff;
        color: #3b82f6;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
        margin-bottom: 1rem;
      }

      h1 {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
      }

      .price {
        font-size: 2rem;
        font-weight: 700;
        color: #3b82f6;
        margin-bottom: 2rem;
      }

      .description-section {
        margin-bottom: 2rem;
      }

      .description-section h3 {
        font-size: 1.125rem;
        margin-bottom: 0.5rem;
      }

      .description-section p {
        color: var(--text-muted);
        line-height: 1.6;
      }

      .stock-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 2rem;
        font-size: 0.875rem;
      }

      .stock-status {
        color: #10b981;
        font-weight: 600;
      }

      .low-stock .stock-status {
        color: #f59e0b;
      }

      .stock-count {
        color: var(--text-muted);
      }

      .purchase-actions {
        display: flex;
        gap: 1rem;
        margin-bottom: 3rem;
      }

      .quantity-selector {
        display: flex;
        align-items: center;
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 0.5rem;
        overflow: hidden;
      }

      .quantity-selector button {
        padding: 0.5rem 1rem;
        background: var(--bg-card);
        border: none;
        color: var(--text-main);
        cursor: pointer;
      }

      .quantity-selector button:hover {
        background: var(--bg-main);
      }

      .quantity-selector span {
        padding: 0 1rem;
        font-weight: 600;
      }

      .add-to-cart-btn {
        flex: 1;
        background: #3b82f6;
        color: white;
        border: none;
        padding: 1rem;
        border-radius: 0.5rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
      }

      .add-to-cart-btn:hover {
        background: #2563eb;
      }

      .features-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        padding-top: 2rem;
        border-top: 1px solid var(--border-color, #e2e8f0);
      }

      .feature {
        display: flex;
        gap: 1rem;
      }

      .feature .icon {
        font-size: 1.5rem;
      }

      .feature strong {
        display: block;
        font-size: 0.9rem;
      }

      .feature p {
        font-size: 0.8rem;
        color: var(--text-muted);
      }

      @media (max-width: 768px) {
        .product-layout {
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        h1 {
          font-size: 2rem;
        }
      }
    `,
  ],
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private inventoryService = inject(InventoryDataService);
  private cartService = inject(CartService);

  product = signal<Product | undefined>(undefined);
  quantity = signal<number>(1);
  loading = signal<boolean>(true);

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const id = +params["id"];
      const p = this.inventoryService.products().find((x) => x.id === id);
      this.product.set(p);
      this.loading.set(false);
    });
  }

  incrementQty() {
    if (this.quantity() < (this.product()?.stock || 0)) {
      this.quantity.update((q) => q + 1);
    }
  }

  decrementQty() {
    if (this.quantity() > 1) {
      this.quantity.update((q) => q - 1);
    }
  }

  addToCart() {
    if (this.product()) {
      this.cartService.addToCart(this.product()!, this.quantity());
    }
  }
}
