import type { Routes } from '@angular/router';
import { StoreLayoutComponent } from './layout/store-layout.component';

export const STORE_ROUTES: Routes = [
  {
    path: '',
    component: StoreLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/store/store-home.component').then((m) => m.StoreHomeComponent),
      },
      {
        path: 'offers',
        loadComponent: () => import('./features/store/product-list.component').then((m) => m.ProductListComponent),
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/store/product-list.component').then((m) => m.ProductListComponent),
      },
      {
        path: 'search',
        loadComponent: () => import('./features/store/search-results.component').then((m) => m.SearchResultsComponent),
      },
      {
        path: 'product/:id',
        loadComponent: () => import('./features/store/product-detail.component').then((m) => m.ProductDetailComponent),
      },
      {
        path: 'cart',
        loadComponent: () => import('./features/store/cart.component').then((m) => m.CartComponent),
      },
      {
        path: 'checkout',
        loadComponent: () => import('./features/store/checkout.component').then((m) => m.CheckoutComponent),
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/store/orders.component').then((m) => m.OrdersComponent),
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/store/settings.component').then((m) => m.SettingsComponent),
      },
      {
        path: 'wishlist',
        loadComponent: () => import('./features/store/wishlist.component').then((m) => m.WishlistComponent),
      },
    ],
  },
];

export const routes: Routes = [...STORE_ROUTES];
