import { Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class StoreStateService {
  searchQuery = signal("");
  selectedCategory = signal<string | null>(null);
  sortBy = signal("name");

  setSearchQuery(query: string) {
    this.searchQuery.set(query);
  }

  setCategory(category: string | null) {
    this.selectedCategory.set(category);
  }

  setSortBy(sort: string) {
    this.sortBy.set(sort);
  }
}
