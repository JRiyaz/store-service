import { Component, inject, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { InventoryDataService, CartService, Product } from "ui-shared";
import { StoreStateService } from "../../services/store-state.service";

@Component({
  selector: "app-product-list",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="product-list-container">
      <header class="list-header">
        <h1>Available Products</h1>
        <div class="filters">
          <select (change)="onCategoryChange($event)" class="filter-select">
            <option value="">All Categories</option>
            <option *ngFor="let cat of categories()" [value]="cat">
              {{ cat }}
            </option>
          </select>
          <select (change)="onSortChange($event)" class="filter-select">
            <option value="name">Sort by Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </header>

      <div class="product-grid">
        <div class="product-card" *ngFor="let product of filteredProducts()">
          <div
            class="product-image"
            [routerLink]="['/store/product', product.id]"
          >
            <span class="category-badge">{{ product.category }}</span>
            <div class="img-placeholder">📦</div>
          </div>
          <div class="product-info">
            <h3
              class="product-name"
              [routerLink]="['/store/product', product.id]"
            >
              {{ product.name }}
            </h3>
            <p class="product-desc">{{ product.description }}</p>
            <div class="product-footer">
              <span class="product-price">{{ product.price | currency }}</span>
              <button class="add-cart-btn" (click)="addToCart(product)">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="filteredProducts().length === 0">
        <p>No products found matching your criteria.</p>
      </div>
    </div>
  `,
  styles: [
    `
      .product-list-container {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .list-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .list-header h1 {
        font-size: 1.875rem;
        font-weight: 700;
      }

      .filters {
        display: flex;
        gap: 1rem;
      }

      .filter-select {
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        border: 1px solid var(--border-color, #e2e8f0);
        background: var(--bg-card, #ffffff);
        color: var(--text-main);
        outline: none;
      }

      .product-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 2rem;
      }

      .product-card {
        background: var(--bg-card, #ffffff);
        border-radius: 1rem;
        overflow: hidden;
        border: 1px solid var(--border-color, #e2e8f0);
        transition:
          transform 0.2s,
          box-shadow 0.2s;
        display: flex;
        flex-direction: column;
      }

      .product-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      }

      .product-image {
        height: 200px;
        background: #f1f5f9;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        cursor: pointer;
      }

      .category-badge {
        position: absolute;
        top: 1rem;
        left: 1rem;
        background: rgba(255, 255, 255, 0.9);
        color: #1e293b;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
        backdrop-filter: blur(4px);
      }

      .img-placeholder {
        font-size: 4rem;
      }

      .product-info {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        flex: 1;
      }

      .product-name {
        font-size: 1.125rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        cursor: pointer;
      }

      .product-name:hover {
        color: #3b82f6;
      }

      .product-desc {
        color: var(--text-muted, #64748b);
        font-size: 0.875rem;
        margin-bottom: 1.5rem;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .product-footer {
        margin-top: auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .product-price {
        font-size: 1.25rem;
        font-weight: 700;
        color: #3b82f6;
      }

      .add-cart-btn {
        background: #3b82f6;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
      }

      .add-cart-btn:hover {
        background: #2563eb;
      }

      .empty-state {
        text-align: center;
        padding: 4rem;
        color: var(--text-muted);
      }

      @media (max-width: 640px) {
        .product-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ProductListComponent {
  private inventoryService = inject(InventoryDataService);
  private cartService = inject(CartService);
  protected storeState = inject(StoreStateService);

  categories = computed(() => {
    const cats = this.inventoryService.products().map((p) => p.category);
    return [...new Set(cats)];
  });

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

  onCategoryChange(event: Event) {
    this.storeState.setCategory((event.target as HTMLSelectElement).value);
  }

  onSortChange(event: Event) {
    this.storeState.setSortBy((event.target as HTMLSelectElement).value);
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }
}
