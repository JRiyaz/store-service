import { CommonModule } from "@angular/common";
import { Component, computed, inject, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { map } from "rxjs/operators";
import {
  AuthStateService,
  InventoryDataService,
  LoaderComponent,
  Product,
  Offer,
} from "ui-shared";
import { CartService } from "../../services/cart.service";

@Component({
  selector: "app-product-detail",
  standalone: true,
  imports: [CommonModule, RouterLink, LoaderComponent],
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
              <div class="price-wrapper flex items-baseline gap-3 relative">
                <div
                  class="price transition-all duration-300"
                  [class.discounted]="activePromotion() && isOfferApplied()"
                >
                  {{
                    (activePromotion() && isOfferApplied()
                      ? (product()?.price || 0) *
                        (1 - activePromotion()!.discount / 100)
                      : product()?.price
                    ) | currency
                  }}
                </div>
                @if (activePromotion() && isOfferApplied()) {
                  <div
                    class="original-price text-sm text-slate-400 line-through font-bold animate-fade-in"
                  >
                    {{ product()?.price | currency }}
                  </div>
                }
              </div>
            </div>
          </div>

          <p class="desc">{{ product()?.description }}</p>

          <div class="action-box">
            <div class="stock" [class.low]="(product()?.stock || 0) < 10">
              <span class="dot"></span>
              {{ (product()?.stock || 0) > 0 ? "In Stock" : "Out of Stock" }}
            </div>

            <!-- Interactive Offer Selection -->
            @if (activePromotion()) {
              <div
                class="offer-selection-area mb-4 p-4 bg-primary/5 rounded-xl border border-primary/10 relative overflow-hidden group"
              >
                <div class="flex items-center justify-between relative z-10">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-xs font-black"
                    >
                      %
                    </div>
                    <div>
                      <p
                        class="text-[10px] font-black text-slate-400 uppercase tracking-widest"
                      >
                        Available Offer
                      </p>
                      <p
                        class="text-xs font-black text-slate-900 dark:text-white"
                      >
                        {{ activePromotion()?.discount }}% Special Discount
                      </p>
                    </div>
                  </div>

                  <button
                    (click)="toggleOffer()"
                    class="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all"
                    [class.bg-primary]="!isOfferApplied()"
                    [class.text-white]="!isOfferApplied()"
                    [class.text-rose-500]="isOfferApplied()"
                    [class.hover:bg-rose-500/10]="isOfferApplied()"
                  >
                    {{ isOfferApplied() ? "Remove" : "Apply" }}
                  </button>
                </div>

                <!-- Sprinkles Animation Layer -->
                @if (isAnimatingSprinkles()) {
                  <div class="sprinkles-container">
                    @for (i of [1, 2, 3, 4, 5, 6, 7, 8]; track i) {
                      <div class="sprinkle" [style.--i]="i"></div>
                    }
                  </div>
                }
              </div>
            }

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
                <button
                  class="btn-primary flex items-center justify-center min-h-[44px]"
                  (click)="addToCart(product()!)"
                  [disabled]="isAddingToCart()"
                >
                  <lib-loader
                    [loading]="isAddingToCart()"
                    label="Add to Cart"
                    customClass="!text-white"
                  ></lib-loader>
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
          <div class="tabs mt-8">
            <div class="tab-item">
              <h3
                class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4"
              >
                Specifications
              </h3>
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
        gap: 0.75rem;
        max-width: 1000px;
        margin: 0 auto;
        padding: 0 1rem;
      }

      .bread {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.7rem;
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
        grid-template-columns: 380px 1fr;
        gap: 2rem;
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
        gap: 1rem;
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
        padding-bottom: 0.75rem;
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
      .price.discounted {
        color: #ef4444;
      }
      .original-price {
        opacity: 0.6;
      }

      .desc {
        font-size: 0.9rem;
        color: var(--text-muted);
        line-height: 1.6;
        margin: 0;
      }

      .action-box {
        padding: 1.25rem;
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
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

      /* Sprinkles Animation */
      .sprinkles-container {
        position: absolute;
        inset: 0;
        pointer-events: none;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 5;
      }
      .sprinkle {
        position: absolute;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: var(--primary);
        opacity: 0;
        animation: sprinkle-out 0.8s ease-out forwards;
      }
      @keyframes sprinkle-out {
        0% {
          transform: scale(0) rotate(0deg) translate(0, 0);
          opacity: 1;
        }
        100% {
          transform: scale(1) rotate(360deg)
            translate(
              calc(cos(var(--i) * 45deg) * 60px),
              calc(sin(var(--i) * 45deg) * 60px)
            );
          opacity: 0;
        }
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
  public auth = inject(AuthStateService);
  private inventoryService = inject(InventoryDataService);
  private cartService = inject(CartService);

  productId = toSignal(
    this.route.params.pipe(map((params) => Number(params["id"]))),
  );

  product = computed(() => {
    const id = this.productId();
    return this.inventoryService.products().find((p) => p.id === id);
  });

  activePromotion = computed(() => {
    const id = this.productId();
    const offers = this.inventoryService.offers();
    return offers.find((o) => o.productId === id);
  });

  isAddingDiscount = signal(false);
  isAnimatingSprinkles = signal(false);
  isOfferApplied = signal(true); // Default to applied for visibility

  toggleOffer() {
    if (!this.isOfferApplied()) {
      this.isAnimatingSprinkles.set(true);
      setTimeout(() => this.isAnimatingSprinkles.set(false), 800);
    }
    this.isOfferApplied.update((v) => !v);
  }

  updateDiscount(val: string) {
    const discount = Number(val);
    const existing = this.activePromotion();

    if (existing) {
      this.inventoryService.updateOffer({
        ...existing,
        discount,
      });
    } else {
      this.addDefaultDiscount(discount);
    }
  }

  removeDiscount() {
    const existing = this.activePromotion();
    if (existing) {
      this.inventoryService.deleteOffer(existing.id);
    }
  }

  addDefaultDiscount(discount = 10) {
    const newOffer: Offer = {
      id: "OFFER-" + Math.random().toString(36).substr(2, 5).toUpperCase(),
      title: `${this.product()?.name} Promo`,
      description: `Storefront promotion`,
      discount,
      productId: this.product()?.id,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      color: "#9333ea",
    };
    this.inventoryService.addOffer(newOffer);
    this.isOfferApplied.set(true);
  }

  loading = computed(() => !this.product() && this.inventoryService.loading());
  isAddingToCart = signal(false);

  getItemInCart(productId: number) {
    return this.cartService.items().find((i) => i.id === productId);
  }
  addToCart(product: Product) {
    this.isAddingToCart.set(true);
    setTimeout(() => {
      this.cartService.addToCart(product);
      this.isAddingToCart.set(false);
    }, 800);
  }
  updateQty(productId: number, qty: number) {
    this.cartService.updateQuantity(productId, qty);
  }
}
