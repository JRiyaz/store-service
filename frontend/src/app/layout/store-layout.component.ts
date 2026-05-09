import { Component, inject } from "@angular/core";
import { RouterOutlet, RouterLink, Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { AuthStateService, CartService, DarkModeService } from "ui-shared";
import { StoreStateService } from "../services/store-state.service";

@Component({
  selector: "app-store-layout",
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="store-container" [class.dark]="darkModeService.isDarkMode()">
      <nav class="store-navbar">
        <div class="navbar-brand" routerLink="/store">
          <span class="logo-icon">🛒</span>
          <span class="logo-text">Industrial<span>Store</span></span>
        </div>

        <div class="navbar-search">
          <input
            type="text"
            placeholder="Search products..."
            (input)="onSearch($event)"
          />
          <span class="search-icon">🔍</span>
        </div>

        <div class="navbar-actions">
          <button
            class="action-btn theme-toggle"
            (click)="darkModeService.toggle()"
            [title]="
              darkModeService.isDarkMode()
                ? 'Switch to Light'
                : 'Switch to Dark'
            "
          >
            {{ darkModeService.isDarkMode() ? "☀️" : "🌙" }}
          </button>

          <div class="cart-wrapper" routerLink="/store/cart">
            <button class="action-btn cart-btn">
              <span>🛒</span>
              <span class="badge" *ngIf="cartService.totalItems() > 0">{{
                cartService.totalItems()
              }}</span>
            </button>
          </div>

          <ng-container *ngIf="authService.isLoggedIn(); else loginBtn">
            <div class="user-profile" routerLink="/store/orders">
              <img
                [src]="authService.avatarUrl()"
                alt="Avatar"
                class="avatar"
              />
              <span class="user-name">{{ authService.user()?.name }}</span>
            </div>
            <button
              class="action-btn logout-btn"
              (click)="authService.logout()"
            >
              Logout
            </button>
          </ng-container>

          <ng-template #loginBtn>
            <button class="login-btn" routerLink="/user/login">Login</button>
          </ng-template>
        </div>
      </nav>

      <main class="store-content">
        <router-outlet />
      </main>

      <footer class="store-footer">
        <div class="footer-content">
          <p>&copy; 2024 Industrial Core IMS. All rights reserved.</p>
          <div class="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
      }

      .store-container {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        background: #f8fafc;
        color: #1e293b;
        transition:
          background 0.3s,
          color 0.3s;
      }

      .store-container.dark {
        background: var(--theme-dark-base, #060714);
        color: #f1f5f9;
        --bg-card: var(--theme-dark-surface, #0a0b21);
        --border-color: rgba(255, 255, 255, 0.06);
        --text-muted: #94a3b8;
      }

      .store-navbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 2rem;
        background: var(--bg-card, #ffffff);
        border-bottom: 1px solid var(--border-color, #e2e8f0);
        position: sticky;
        top: 0;
        z-index: 100;
        backdrop-filter: blur(12px);
      }

      .navbar-brand {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        font-size: 1.25rem;
        font-weight: 900;
        letter-spacing: -0.025em;
      }

      .logo-text span {
        color: var(--theme-primary);
      }

      .navbar-search {
        flex: 1;
        max-width: 500px;
        margin: 0 2rem;
        position: relative;
      }

      .navbar-search input {
        width: 100%;
        padding: 0.6rem 1rem 0.6rem 2.5rem;
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 12px;
        background: var(--bg-main, #f8fafc);
        color: inherit;
        outline: none;
        transition: all 0.2s;
      }

      .store-container.dark .navbar-search input {
        background: rgba(255, 255, 255, 0.03);
      }

      .navbar-search input:focus {
        border-color: var(--theme-primary);
        box-shadow: 0 0 0 4px
          color-mix(in srgb, var(--theme-primary), transparent 90%);
      }

      .search-icon {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-muted, #64748b);
        font-size: 0.9rem;
      }

      .navbar-actions {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .action-btn {
        background: none;
        border: none;
        font-size: 1.1rem;
        cursor: pointer;
        color: inherit;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.6rem;
        border-radius: 10px;
        transition: all 0.2s;
      }

      .action-btn:hover {
        background: var(--bg-main, #f1f5f9);
        color: var(--theme-primary);
      }

      .store-container.dark .action-btn:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      .cart-wrapper {
        position: relative;
        cursor: pointer;
      }

      .badge {
        position: absolute;
        top: 0;
        right: 0;
        background: var(--theme-primary);
        color: white;
        font-size: 0.65rem;
        min-width: 18px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 9999px;
        font-weight: 800;
        border: 2px solid var(--bg-card, #fff);
      }

      .user-profile {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        cursor: pointer;
        padding: 0.4rem 0.75rem;
        border-radius: 12px;
        background: var(--bg-main, #f1f5f9);
        border: 1px solid transparent;
        transition: all 0.2s;
      }

      .store-container.dark .user-profile {
        background: rgba(255, 255, 255, 0.03);
      }

      .user-profile:hover {
        border-color: var(--theme-primary);
      }

      .avatar {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        object-fit: cover;
      }

      .user-name {
        font-size: 0.85rem;
        font-weight: 700;
      }

      .login-btn {
        background: var(--theme-primary);
        color: white;
        border: none;
        padding: 0.6rem 1.25rem;
        border-radius: 10px;
        font-weight: 800;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.025em;
        cursor: pointer;
        transition: all 0.2s;
      }

      .login-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px
          color-mix(in srgb, var(--theme-primary), transparent 70%);
      }

      .logout-btn {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--text-muted);
      }

      .store-content {
        flex: 1;
        padding: 2rem;
        max-width: 1400px;
        margin: 0 auto;
        width: 100%;
      }

      .store-footer {
        background: var(--bg-card, #ffffff);
        border-top: 1px solid var(--border-color, #e2e8f0);
        padding: 3rem 2rem;
        margin-top: auto;
      }

      .footer-content {
        max-width: 1400px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 2rem;
        align-items: center;
        color: var(--text-muted, #64748b);
        font-size: 0.85rem;
      }

      .footer-links {
        display: flex;
        gap: 2rem;
      }

      .footer-links a {
        color: inherit;
        text-decoration: none;
        font-weight: 600;
        transition: color 0.2s;
      }

      .footer-links a:hover {
        color: var(--theme-primary);
      }

      @media (max-width: 768px) {
        .navbar-search {
          display: none;
        }
        .store-navbar {
          padding: 0.75rem 1rem;
        }
        .user-name {
          display: none;
        }
        .footer-content {
          text-align: center;
        }
      }
    `,
  ],
})
export class StoreLayoutComponent {
  authService = inject(AuthStateService);
  cartService = inject(CartService);
  darkModeService = inject(DarkModeService);
  private storeState = inject(StoreStateService);
  private router = inject(Router);

  onSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    this.storeState.setSearchQuery(query);
    if (
      this.router.url !== "/store" &&
      !this.router.url.startsWith("/store?")
    ) {
      this.router.navigate(["/store"]);
    }
  }
}
