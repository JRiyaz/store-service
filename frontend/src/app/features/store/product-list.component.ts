import {
  Component,
  inject,
  computed,
  signal,
  HostListener,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { InventoryDataService, CartService, Product } from "ui-shared";
import { StoreStateService } from "../../services/store-state.service";

@Component({
  selector: "app-product-list",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="shopper-products-page animate-fade-in">
      <!-- Compact Sidebar -->
      <aside class="shopper-sidebar">
        <div class="sidebar-section">
          <h3>Categories</h3>
          <ul class="cat-list">
            <li
              [class.active]="!storeState.selectedCategory()"
              (click)="selectCategory(null)"
            >
              All <span>{{ inventoryService.products().length }}</span>
            </li>
            <li
              *ngFor="let cat of categories()"
              [class.active]="storeState.selectedCategory() === cat"
              (click)="selectCategory(cat)"
            >
              {{ cat }} <span>{{ getCategoryCount(cat) }}</span>
            </li>
          </ul>
        </div>

        <div class="sidebar-section">
          <h3>Price</h3>
          <div class="price-opts">
            <label class="check-opt"
              ><input type="checkbox" /> Under $100</label
            >
            <label class="check-opt"
              ><input type="checkbox" /> $100 - $500</label
            >
            <label class="check-opt"><input type="checkbox" /> Over $500</label>
          </div>
        </div>

        <div class="sidebar-section">
          <h3>Size</h3>
          <div class="size-grid">
            <button class="size-btn">S</button>
            <button class="size-btn active">M</button>
            <button class="size-btn">L</button>
            <button class="size-btn">XL</button>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="shopper-content">
        <!-- Compact Header -->
        <header class="content-header">
          <div class="h-left">
            <h1>{{ storeState.selectedCategory() || "Store" }}</h1>
            <p class="results-count">
              {{ filteredProducts().length }} items found
            </p>
          </div>

          <div class="h-right">
            <div
              class="sort-wrap"
              (click)="$event.stopPropagation(); toggleSort()"
            >
              <button class="sort-btn">
                <span>{{ getSortLabel() }}</span>
                <span class="chev">▾</span>
              </button>
              <div class="sort-menu" *ngIf="isSortOpen()">
                <div class="option" (click)="selectSort('name')">Name: A-Z</div>
                <div class="option" (click)="selectSort('price-low')">
                  Price: Low
                </div>
                <div class="option" (click)="selectSort('price-high')">
                  Price: High
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- Tight Grid (3-4 columns) -->
        <div class="shopper-grid">
          <div class="product-card" *ngFor="let product of filteredProducts()">
            <div
              class="card-visual"
              [routerLink]="['/store/product', product.id]"
            >
              <div class="img-bg">
                <span class="icon">📦</span>
              </div>
              <div class="card-badge" *ngIf="product.stock < 10">Low</div>

              <!-- Compact Hover Actions -->
              <div class="card-hover-actions">
                <ng-container
                  *ngIf="getItemInCart(product.id) as item; else addBtn"
                >
                  <div class="pill-stepper" (click)="$event.stopPropagation()">
                    <button (click)="updateQty(product.id, item.quantity - 1)">
                      −
                    </button>
                    <span class="val">{{ item.quantity }}</span>
                    <button (click)="updateQty(product.id, item.quantity + 1)">
                      +
                    </button>
                  </div>
                </ng-container>
                <ng-template #addBtn>
                  <button
                    class="pill-btn add"
                    (click)="$event.stopPropagation(); addToCart(product)"
                  >
                    Add to Cart
                  </button>
                </ng-template>
              </div>
            </div>

            <div class="card-info">
              <div class="info-top">
                <span class="category">{{ product.category }}</span>
                <span class="stars">★ 4.8</span>
              </div>
              <h3 class="name" [routerLink]="['/store/product', product.id]">
                {{ product.name }}
              </h3>
              <div class="info-bottom">
                <span class="price">{{ product.price | currency }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="catalog-empty" *ngIf="filteredProducts().length === 0">
          <div class="empty-icon">🔎</div>
          <h2>No items</h2>
          <button class="shopper-btn-primary" (click)="clearFilters()">
            Clear
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .shopper-products-page {
        display: grid;
        grid-template-columns: 210px 1fr;
        gap: 3rem;
        align-items: start;
      }

      /* Compact Sidebar */
      .shopper-sidebar {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }
      .sidebar-section h3 {
        font-size: 0.8rem;
        font-weight: 800;
        margin-bottom: 1rem;
        color: var(--text);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .cat-list {
        list-style: none;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .cat-list li {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-muted);
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        transition: color 0.1s;
      }
      .cat-list li span {
        font-weight: 700;
        color: #9ca3af;
        font-size: 0.75rem;
      }
      .cat-list li:hover,
      .cat-list li.active {
        color: var(--primary);
      }

      .price-opts {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .check-opt {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-muted);
        cursor: pointer;
      }
      .check-opt input {
        width: 15px;
        height: 15px;
        accent-color: var(--primary);
      }

      .size-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 0.4rem;
      }
      .size-btn {
        aspect-ratio: 1;
        border: 1px solid var(--border);
        background: var(--surface);
        border-radius: 6px;
        font-size: 0.7rem;
        font-weight: 800;
        color: var(--text);
        cursor: pointer;
      }
      .size-btn:hover,
      .size-btn.active {
        border-color: var(--primary);
        color: var(--primary);
      }

      /* Compact Content */
      .content-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--border);
      }
      .content-header h1 {
        font-size: 1.5rem;
        font-weight: 900;
        margin: 0;
        color: var(--text);
        letter-spacing: -0.03em;
      }
      .results-count {
        font-size: 0.8rem;
        color: var(--text-muted);
        font-weight: 600;
      }

      .sort-wrap {
        position: relative;
      }
      .sort-btn {
        background: none;
        border: 1px solid var(--border);
        padding: 0.4rem 0.75rem;
        border-radius: 8px;
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--text);
        cursor: pointer;
      }
      .sort-btn span {
        color: var(--primary);
      }

      .sort-menu {
        position: absolute;
        top: calc(100% + 0.4rem);
        right: 0;
        width: 180px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 0.3rem;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
        z-index: 100;
      }
      .option {
        padding: 0.5rem 0.75rem;
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--text);
        border-radius: 6px;
        cursor: pointer;
      }
      .option:hover {
        background: var(--bg);
        color: var(--primary);
      }

      /* Tight Grid (Smaller Cards) */
      .shopper-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
        gap: 2rem 1.5rem;
      }

      .product-card {
        display: flex;
        flex-direction: column;
      }

      .card-visual {
        position: relative;
        aspect-ratio: 1.1;
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 12px;
        overflow: hidden;
        cursor: pointer;
        margin-bottom: 1rem;
      }
      .img-bg {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .icon {
        font-size: 2.5rem;
        opacity: 0.2;
      }

      .card-badge {
        position: absolute;
        top: 0.75rem;
        left: 0.75rem;
        background: #ef4444;
        color: white;
        font-size: 0.6rem;
        font-weight: 900;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        text-transform: uppercase;
      }

      .card-hover-actions {
        position: absolute;
        bottom: 1rem;
        left: 50%;
        transform: translateX(-50%) translateY(10px);
        display: flex;
        gap: 0.4rem;
        opacity: 0;
        transition: all 0.2s ease;
      }
      .product-card:hover .card-hover-actions {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }

      .pill-btn {
        background: white;
        color: #111827;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 99px;
        font-size: 0.75rem;
        font-weight: 800;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        white-space: nowrap;
      }
      .pill-btn.add:hover {
        background: var(--primary);
        color: white;
      }

      .pill-stepper {
        background: white;
        color: #111827;
        border-radius: 99px;
        display: flex;
        align-items: center;
        padding: 0.2rem;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      }
      .pill-stepper button {
        width: 28px;
        height: 28px;
        border: none;
        background: #f3f4f6;
        border-radius: 50%;
        font-weight: 800;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .pill-stepper button:hover {
        background: var(--primary);
        color: white;
      }
      .pill-stepper .val {
        font-size: 0.85rem;
        font-weight: 800;
        padding: 0 0.75rem;
        min-width: 30px;
        text-align: center;
      }

      .card-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .info-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .info-top .category {
        font-size: 0.7rem;
        color: var(--text-muted);
        font-weight: 700;
        text-transform: uppercase;
      }
      .stars {
        font-size: 0.7rem;
        color: #fbbf24;
        font-weight: 800;
      }

      .card-info h3 {
        font-size: 0.95rem;
        font-weight: 700;
        margin: 0;
        color: var(--text);
        cursor: pointer;
        transition: color 0.1s;
      }
      .card-info h3:hover {
        color: var(--primary);
      }

      .info-bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 0.25rem;
      }
      .price {
        font-size: 1rem;
        font-weight: 900;
        color: var(--text);
      }

      .mini-stepper {
        display: flex;
        align-items: center;
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 99px;
        padding: 0.15rem;
      }
      .mini-stepper button {
        width: 24px;
        height: 24px;
        border: none;
        background: var(--surface);
        color: var(--text);
        border-radius: 50%;
        font-weight: 800;
        cursor: pointer;
      }
      .mini-stepper button:hover {
        background: var(--primary);
        color: white;
      }
      .mini-stepper .qty {
        padding: 0 0.5rem;
        font-size: 0.8rem;
        font-weight: 800;
      }

      /* Empty */
      .catalog-empty {
        grid-column: 1 / -1;
        padding: 6rem 2rem;
        text-align: center;
        color: var(--text-muted);
      }

      @media (max-width: 900px) {
        .shopper-products-page {
          grid-template-columns: 1fr;
        }
        .shopper-sidebar {
          display: none;
        }
      }
    `,
  ],
})
export class ProductListComponent {
  protected inventoryService = inject(InventoryDataService);
  private cartService = inject(CartService);
  protected storeState = inject(StoreStateService);

  isSortOpen = signal(false);

  @HostListener("document:click")
  closeDropdowns() {
    this.isSortOpen.set(false);
  }

  toggleSort() {
    this.isSortOpen.update((v) => !v);
  }

  categories = computed(() => {
    const cats = this.inventoryService.products().map((p) => p.category);
    return [...new Set(cats)];
  });

  getCategoryCount(cat: string) {
    return this.inventoryService.products().filter((p) => p.category === cat)
      .length;
  }

  filteredProducts = computed(() => {
    let prods = [...this.inventoryService.products()];
    const query = this.storeState.searchQuery().toLowerCase();
    const category = this.storeState.selectedCategory();
    const sortBy = this.storeState.sortBy();

    if (query) {
      prods = prods.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query),
      );
    }

    if (category) {
      prods = prods.filter((p) => p.category === category);
    }

    prods.sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      return a.name.localeCompare(b.name);
    });

    return prods;
  });

  getSortLabel() {
    const sort = this.storeState.sortBy();
    if (sort === "price-low") return "Price: Low";
    if (sort === "price-high") return "Price: High";
    return "Sort: A-Z";
  }

  selectCategory(category: string | null) {
    this.storeState.setCategory(category);
  }

  selectSort(sort: string) {
    this.storeState.setSortBy(sort);
    this.isSortOpen.set(false);
  }

  clearFilters() {
    this.storeState.setSearchQuery("");
    this.storeState.setCategory(null);
  }

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
