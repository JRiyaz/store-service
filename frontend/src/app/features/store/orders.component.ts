import { Component, inject, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { InventoryDataService, AuthStateService, Order } from "ui-shared";

@Component({
  selector: "app-orders",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="orders-container">
      <h1>My Orders</h1>

      <div class="orders-list" *ngIf="userOrders().length > 0; else noOrders">
        <div class="order-card" *ngFor="let order of userOrders()">
          <div class="order-header">
            <div class="header-info">
              <span class="order-number">Order #{{ order.id }}</span>
              <span class="order-date">Placed on {{ order.date }}</span>
            </div>
            <div class="header-status">
              <span class="status-badge" [class]="order.status.toLowerCase()">{{
                order.status
              }}</span>
            </div>
          </div>

          <div class="order-body">
            <div class="order-items">
              <div class="order-item" *ngFor="let item of order.items">
                <span class="item-qty">{{ item.qty }}x</span>
                <span class="item-name">{{ item.name }}</span>
                <span class="item-price">{{
                  item.price * item.qty | currency
                }}</span>
              </div>
            </div>

            <div class="order-summary">
              <div class="total-row">
                <span>Total Amount:</span>
                <span class="total-price">{{ order.amount | currency }}</span>
              </div>
            </div>
          </div>

          <div class="order-actions">
            <button class="track-btn">Track Shipment</button>
            <button
              class="cancel-btn"
              *ngIf="
                order.status === 'Pending' || order.status === 'Processing'
              "
              (click)="requestCancel(order.id)"
            >
              Request Cancellation
            </button>
          </div>
        </div>
      </div>

      <ng-template #noOrders>
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <h2>No orders yet</h2>
          <p>You haven't placed any orders yet. Start exploring our catalog!</p>
          <button class="shop-btn" routerLink="/store">Start Shopping</button>
        </div>
      </ng-template>
    </div>

    <!-- Cancellation Modal Placeholder -->
    <div class="modal-overlay" *ngIf="showCancelModal()">
      <div class="modal-content">
        <h2>Cancel Order #{{ selectedOrderId() }}</h2>
        <p>
          Are you sure you want to request a cancellation for this order? This
          action cannot be undone.
        </p>
        <div class="modal-actions">
          <button class="confirm-btn" (click)="confirmCancel()">
            Confirm Cancellation
          </button>
          <button class="close-btn" (click)="showCancelModal.set(false)">
            Close
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .orders-container {
        max-width: 900px;
        margin: 0 auto;
      }

      h1 {
        margin-bottom: 2rem;
      }

      .orders-list {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .order-card {
        background: var(--bg-card, #ffffff);
        border-radius: 1rem;
        border: 1px solid var(--border-color, #e2e8f0);
        overflow: hidden;
      }

      .order-header {
        padding: 1.5rem;
        background: var(--bg-main, #f8fafc);
        border-bottom: 1px solid var(--border-color, #e2e8f0);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .order-number {
        font-weight: 700;
        font-size: 1.1rem;
        display: block;
      }
      .order-date {
        font-size: 0.875rem;
        color: var(--text-muted);
      }

      .status-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
      }

      .status-badge.pending {
        background: #fef3c7;
        color: #d97706;
      }
      .status-badge.processing {
        background: #dcfce7;
        color: #16a34a;
      }
      .status-badge.completed {
        background: #dbeafe;
        color: #2563eb;
      }
      .status-badge.cancelled {
        background: #fee2e2;
        color: #dc2626;
      }

      .order-body {
        padding: 1.5rem;
      }

      .order-items {
        margin-bottom: 1.5rem;
      }

      .order-item {
        display: flex;
        gap: 1rem;
        margin-bottom: 0.5rem;
        font-size: 0.95rem;
      }

      .item-qty {
        font-weight: 600;
        color: #3b82f6;
        width: 30px;
      }
      .item-name {
        flex: 1;
      }
      .item-price {
        color: var(--text-muted);
      }

      .order-summary {
        border-top: 1px dashed var(--border-color, #e2e8f0);
        padding-top: 1rem;
      }

      .total-row {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 1rem;
        font-weight: 700;
      }

      .total-price {
        font-size: 1.25rem;
        color: #3b82f6;
      }

      .order-actions {
        padding: 1rem 1.5rem;
        background: var(--bg-main, #f8fafc);
        border-top: 1px solid var(--border-color, #e2e8f0);
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
      }

      .track-btn {
        background: #3b82f6;
        color: white;
        border: none;
        padding: 0.5rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: 600;
        cursor: pointer;
      }

      .cancel-btn {
        background: none;
        border: 1px solid #ef4444;
        color: #ef4444;
        padding: 0.5rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: 600;
        cursor: pointer;
      }

      .empty-state {
        text-align: center;
        padding: 4rem;
      }
      .empty-icon {
        font-size: 4rem;
        margin-bottom: 1.5rem;
      }
      .shop-btn {
        background: #3b82f6;
        color: white;
        border: none;
        padding: 0.75rem 2rem;
        border-radius: 0.5rem;
        cursor: pointer;
        margin-top: 2rem;
      }

      /* Modal Styles */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(4px);
      }

      .modal-content {
        background: var(--bg-card, #ffffff);
        padding: 2.5rem;
        border-radius: 1.5rem;
        max-width: 500px;
        width: 90%;
        text-align: center;
      }

      .modal-content h2 {
        margin-bottom: 1rem;
      }
      .modal-content p {
        color: var(--text-muted);
        margin-bottom: 2rem;
        line-height: 1.6;
      }

      .modal-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
      }

      .confirm-btn {
        background: #ef4444;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: 600;
        cursor: pointer;
      }
      .close-btn {
        background: none;
        border: 1px solid var(--border-color);
        color: var(--text-main);
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: 600;
        cursor: pointer;
      }
    `,
  ],
})
export class OrdersComponent {
  private inventoryService = inject(InventoryDataService);
  private authService = inject(AuthStateService);

  userOrders = computed(() => {
    const userName = this.authService.user()?.name;
    if (!userName) return [];
    return this.inventoryService
      .orders()
      .filter((o) => o.customer === userName)
      .reverse();
  });

  showCancelModal = signal(false);
  selectedOrderId = signal("");

  requestCancel(orderId: string) {
    this.selectedOrderId.set(orderId);
    this.showCancelModal.set(true);
  }

  confirmCancel() {
    const id = this.selectedOrderId();
    this.inventoryService.orders.update((orders) =>
      orders.map((o) => (o.id === id ? { ...o, status: "Cancelled" } : o)),
    );
    this.showCancelModal.set(false);
  }
}
