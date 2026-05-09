import { Component, inject, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, ActivatedRoute } from "@angular/router";
import { InventoryDataService, Product } from "ui-shared";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs/operators";
import { WishlistService } from "../../services/wishlist.service";
import { CartService } from "../../services/cart.service";

@Component({
  selector: "app-product-detail",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div
      class="shopper-detail animate-fade-in"
      *ngIf="product(); else notFound"
    >
      <nav class="bread">
        <a routerLink="/store">Store</a>
        <span>/</span>
        <a
          routerLink="/store"
          [queryParams]="{ category: product()?.category }"
          >{{ product()?.category }}</a
        >
        <span>/</span>
        <span class="curr">{{ product()?.name }}</span>
      </nav>

      <div class="detail-grid">
        <!-- Left: Image -->
        <div class="visual-col">
          <div class="main-img">
            <span>📦</span>
          </div>
          <div class="thumbs">
            <div class="thumb active"><span>📦</span></div>
            <div class="thumb"><span>📦</span></div>
            <div class="thumb"><span>📦</span></div>
          </div>
        </div>

        <!-- Right: Info -->
        <div class="info-col">
          <div class="info-head">
            <span class="cat">{{ product()?.category }}</span>
            <h1>{{ product()?.name }}</h1>
            <div class="meta">
              <div class="stars">★★★★★ <span>(12)</span></div>
              <div class="price">{{ product()?.price | currency }}</div>
            </div>
          </div>

          <p class="desc">{{ product()?.description }}</p>

          <div class="action-box">
            <div class="stock" [class.low]="(product()?.stock || 0) < 10">
              <span class="dot"></span>
              {{ (product()?.stock || 0) > 0 ? "In Stock" : "Out of Stock" }}
            </div>

            <div class="actions">
              <ng-container
                *ngIf="getItemInCart(product()!.id) as item; else addBtn"
              >
                <div class="stepper">
                  <button (click)="updateQty(product()!.id, item.quantity - 1)">
                    −
                  </button>
                  <span class="val">{{ item.quantity }}</span>
                  <button (click)="updateQty(product()!.id, item.quantity + 1)">
                    +
                  </button>
                </div>
              </ng-container>

              <ng-template #addBtn>
                <button class="btn-primary" (click)="addToCart(product()!)">
                  Add to Cart
                </button>
              </ng-template>

              <button class="btn-wish">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  ></path>
                </svg>
              </button>
            </div>
          </div>

          <div class="tabs">
            <div class="tab-item">
              <h3>Specifications</h3>
              <ul class="spec-list">
                <li><span>Material</span> Industrial Polymer</li>
                <li><span>Weight</span> 1.2 kg</li>
                <li><span>Warranty</span> 1 Year</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ng-template #notFound>
      <div class="not-found" *ngIf="!loading()">
        <h2>Product not found</h2>
        <button class="btn-primary !w-auto !px-10" routerLink="/store">
          Return to Store
        </button>
      </div>
    </ng-template>
  `,
  styles: [
    `
      .shopper-detail {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        max-width: 1000px;
        margin: 0 auto;
      }

      .bread {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-muted);
      }
      .bread a {
        color: inherit;
        text-decoration: none;
      }
      .bread span {
        opacity: 0.4;
      }
      .bread .curr {
        color: var(--text);
      }

      .detail-grid {
        display: grid;
        grid-template-columns: 420px 1fr;
        gap: 3rem;
        align-items: start;
      }

      /* Visuals */
      .visual-col {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .main-img {
        aspect-ratio: 1;
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 5rem;
      }
      .thumbs {
        display: flex;
        gap: 0.75rem;
      }
      .thumb {
        width: 60px;
        height: 60px;
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 1.25rem;
      }
      .thumb.active {
        border-color: var(--primary);
      }

      /* Info */
      .info-col {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
      .cat {
        font-size: 0.7rem;
        font-weight: 800;
        color: var(--primary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .info-head h1 {
        font-size: 1.5rem;
        font-weight: 800;
        margin: 0.25rem 0 0.75rem;
        color: var(--text);
        letter-spacing: -0.02em;
      }

      .meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--border);
      }
      .stars {
        font-size: 0.8rem;
        color: #fbbf24;
        font-weight: 800;
      }
      .stars span {
        color: var(--text-muted);
        font-weight: 600;
      }
      .price {
        font-size: 1.5rem;
        font-weight: 900;
        color: var(--primary);
      }

      .desc {
        font-size: 0.9rem;
        color: var(--text-muted);
        line-height: 1.6;
        margin: 0;
      }

      .action-box {
        padding: 1.5rem;
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .stock {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.75rem;
        font-weight: 700;
        color: #10b981;
      }
      .stock .dot {
        width: 6px;
        height: 6px;
        background: #10b981;
        border-radius: 50%;
      }
      .stock.low {
        color: #f59e0b;
      }
      .stock.low .dot {
        background: #f59e0b;
      }

      .actions {
        display: flex;
        gap: 0.75rem;
      }
      .btn-primary {
        flex: 1;
        background: var(--primary);
        color: white;
        border: none;
        padding: 0.85rem;
        border-radius: 10px;
        font-size: 0.9rem;
        font-weight: 800;
        cursor: pointer;
      }
      .btn-wish {
        width: 44px;
        height: 44px;
        background: var(--surface);
        border: 1.5px solid var(--border);
        border-radius: 10px;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
      .btn-wish:hover {
        border-color: var(--primary);
        color: var(--primary);
      }

      .stepper {
        flex: 1;
        display: flex;
        align-items: center;
        background: var(--surface);
        border: 1.5px solid var(--border);
        border-radius: 10px;
        padding: 0.2rem;
      }
      .stepper button {
        width: 34px;
        height: 34px;
        border: none;
        background: var(--bg);
        color: var(--text);
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 800;
        cursor: pointer;
      }
      .stepper button:hover {
        background: var(--primary);
        color: white;
      }
      .stepper .val {
        flex: 1;
        text-align: center;
        font-size: 1rem;
        font-weight: 800;
      }

      .tabs h3 {
        font-size: 0.85rem;
        font-weight: 800;
        margin-bottom: 0.75rem;
        text-transform: uppercase;
        color: var(--text);
      }
      .spec-list {
        list-style: none;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .spec-list li {
        display: flex;
        justify-content: space-between;
        font-size: 0.85rem;
        color: var(--text-muted);
        font-weight: 600;
        border-bottom: 1px dashed var(--border);
        padding-bottom: 0.4rem;
      }
      .spec-list li span {
        color: var(--text);
        font-weight: 700;
      }

      .not-found {
        padding: 6rem 2rem;
        text-align: center;
        color: var(--text-muted);
      }

      @media (max-width: 900px) {
        .detail-grid {
          grid-template-columns: 1fr;
        }
        .visual-col {
          max-width: 100%;
        }
      }
    `,
  ],
})
export class ProductDetailComponent {
  private route = inject(ActivatedRoute);
  private inventoryService = inject(InventoryDataService);
  private cartService = inject(CartService);

  productId = toSignal(
    this.route.params.pipe(map((params) => Number(params["id"]))),
  );

  product = computed(() => {
    const id = this.productId();
    return this.inventoryService.products().find((p) => p.id === id);
  });

  loading = computed(() => !this.product() && this.inventoryService.loading());

  getItemInCart(productId: number) {
    return this.cartService.items().find((i) => i.id === productId);
  }
  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }
  updateQty(productId: number, qty: number) {
    this.cartService.updateQuantity(productId, qty);
  }
}
