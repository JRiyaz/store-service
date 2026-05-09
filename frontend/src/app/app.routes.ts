import { Routes } from "@angular/router";
import { StoreLayoutComponent } from "./layout/store-layout.component";

export const STORE_ROUTES: Routes = [
  {
    path: "",
    component: StoreLayoutComponent,
    children: [
      {
        path: "",
        loadComponent: () =>
          import("./features/store/product-list.component").then(
            (m) => m.ProductListComponent,
          ),
      },
      {
        path: "product/:id",
        loadComponent: () =>
          import("./features/store/product-detail.component").then(
            (m) => m.ProductDetailComponent,
          ),
      },
      {
        path: "cart",
        loadComponent: () =>
          import("./features/store/cart.component").then(
            (m) => m.CartComponent,
          ),
      },
      {
        path: "checkout",
        loadComponent: () =>
          import("./features/store/checkout.component").then(
            (m) => m.CheckoutComponent,
          ),
      },
      {
        path: "orders",
        loadComponent: () =>
          import("./features/store/orders.component").then(
            (m) => m.OrdersComponent,
          ),
      },
    ],
  },
];

export const routes: Routes = [...STORE_ROUTES];
