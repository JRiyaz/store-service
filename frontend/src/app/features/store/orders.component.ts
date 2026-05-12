import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStateService, InventoryDataService } from 'ui-shared';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="shopper-orders animate-fade-in">
      <header class="orders-head">
        <h1>Orders</h1>
        <p>You have {{ userOrders().length }} orders in your history.</p>
      </header>

      <div class="stats-row">
        <div class="stat-box">
          <span class="l">Total</span>
          <span class="v">{{ userOrders().length }}</span>
        </div>
        <div class="stat-box">
          <span class="l">Pending</span>
          <span class="v">{{ pendingCount() }}</span>
        </div>
      </div>

      <div class="orders-list" *ngIf="userOrders().length > 0; else noOrders">
        <div class="order-card shopper-card" *ngFor="let order of userOrders()">
          <div class="order-info">
            <div class="id-col">
              <span class="l">Order #</span>
              <span class="v">{{ order.id }}</span>
            </div>

            <div class="meta-row">
              <div class="m-col">
                <span class="l">Date</span>
                <span class="v">{{ order.date }}</span>
              </div>
              <div class="m-col">
                <span class="l">Total</span>
                <span class="v p">{{ order.amount | currency }}</span>
              </div>
            </div>

            <div class="status-col">
              <span class="status-tag" [attr.data-status]="order.status">{{
                order.status
              }}</span>
            </div>

            <div class="action-col">
              <button class="btn-detail" (click)="toggleDetails(order.id)">
                {{ expandedOrderId() === order.id ? "Hide" : "Details" }}
              </button>
            </div>
          </div>

          <div
            class="order-expand animate-slide-up"
            *ngIf="expandedOrderId() === order.id"
          >
            <div class="item-table">
              <div class="t-head">
                <span>Product</span>
                <span>Qty</span>
                <span>Price</span>
              </div>
              <div class="t-row" *ngFor="let item of order.items">
                <span class="n">{{ item.name }}</span>
                <span>{{ item.qty }}</span>
                <span class="p">{{ item.price | currency }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #noOrders>
        <div class="no-orders shopper-card">
          <div class="icon">📦</div>
          <h2>No orders yet</h2>
          <button class="btn-detail !w-auto !px-10" routerLink="/store">
            Go Shopping
          </button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [
    `
      .shopper-orders {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        max-width: 1000px;
        margin: 0 auto;
      }

      .orders-head h1 {
        font-size: 1.75rem;
        font-weight: 800;
        margin: 0;
        color: var(--text);
        letter-spacing: -0.02em;
      }
      .orders-head p {
        font-size: 0.85rem;
        color: var(--text-muted);
        margin-top: 0.25rem;
      }

      .stats-row {
        display: flex;
        gap: 1rem;
      }
      .stat-box {
        flex: 1;
        padding: 1.25rem;
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .stat-box .l {
        font-size: 0.7rem;
        font-weight: 800;
        color: var(--text-muted);
        text-transform: uppercase;
      }
      .stat-box .v {
        font-size: 1.5rem;
        font-weight: 900;
        color: var(--primary);
      }

      .orders-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .shopper-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 1rem;
        padding: 1rem 1.5rem;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
      }

      .order-info {
        display: grid;
        grid-template-columns: 140px 1fr 140px 100px;
        gap: 1.5rem;
        align-items: center;
      }

      .id-col .l {
        font-size: 0.65rem;
        font-weight: 800;
        color: var(--text-muted);
        text-transform: uppercase;
      }
      .id-col .v {
        font-size: 1.1rem;
        font-weight: 900;
        color: var(--text);
      }

      .meta-row {
        display: flex;
        gap: 2rem;
      }
      .m-col .l {
        font-size: 0.65rem;
        font-weight: 800;
        color: var(--text-muted);
        text-transform: uppercase;
      }
      .m-col .v {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--text);
      }
      .m-col .v.p {
        color: var(--primary);
        font-weight: 900;
      }

      .status-tag {
        font-size: 0.65rem;
        font-weight: 900;
        padding: 0.3rem 0.75rem;
        border-radius: 99px;
        text-transform: uppercase;
      }
      .status-tag[data-status="Pending"] {
        background: #fef9c3;
        color: #a16207;
      }
      .status-tag[data-status="Completed"] {
        background: #f0fdf4;
        color: #16a34a;
      }
      .status-tag[data-status="Cancelled"] {
        background: #fef2f2;
        color: #dc2626;
      }

      .btn-detail {
        background: var(--bg);
        border: 1px solid var(--border);
        color: var(--text);
        padding: 0.5rem 0.75rem;
        border-radius: 8px;
        font-size: 0.75rem;
        font-weight: 800;
        cursor: pointer;
      }
      .btn-detail:hover {
        border-color: var(--primary);
        color: var(--primary);
      }

      .order-expand {
        margin-top: 1rem;
        border-top: 1px dashed var(--border);
        padding-top: 1rem;
      }
      .item-table {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .t-head {
        display: grid;
        grid-template-columns: 1fr 60px 100px;
        font-size: 0.65rem;
        font-weight: 900;
        color: var(--text-muted);
        text-transform: uppercase;
        padding: 0 0.5rem;
      }
      .t-row {
        display: grid;
        grid-template-columns: 1fr 60px 100px;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text);
        padding: 0.5rem;
        border-bottom: 1px solid var(--border);
      }
      .t-row:last-child {
        border: none;
      }
      .t-row .n {
        font-weight: 800;
      }
      .t-row .p {
        font-weight: 800;
        text-align: right;
        color: var(--primary);
      }
      .t-row span:nth-child(2) {
        text-align: center;
      }

      .no-orders {
        padding: 4rem 2rem;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }
      .no-orders .icon {
        font-size: 3rem;
        opacity: 0.1;
      }

      @media (max-width: 768px) {
        .order-info {
          grid-template-columns: 1fr 1fr;
        }
        .action-col {
          grid-column: span 2;
        }
      }
    `,
  ],
})
export class OrdersComponent {
  private inventoryService = inject(InventoryDataService);
  private authService = inject(AuthStateService);
  expandedOrderId = signal<string | null>(null);

  userOrders = computed(() => {
    const userName = this.authService.user()?.name;
    if (!userName) return [];
    return this.inventoryService.orders().filter((o) => o.customer === userName);
  });

  pendingCount = computed(() => this.userOrders().filter((o) => o.status === 'Pending').length);
  toggleDetails(id: string) {
    this.expandedOrderId.set(this.expandedOrderId() === id ? null : id);
  }
}
