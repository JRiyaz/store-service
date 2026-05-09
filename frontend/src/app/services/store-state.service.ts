import { Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class StoreStateService {
  searchQuery = signal("");
  selectedCategory = signal("");
  sortBy = signal("name");

  setSearchQuery(query: string) {
    this.searchQuery.set(query);
  }

  setCategory(category: string) {
    this.selectedCategory.set(category);
  }

  setSortBy(sort: string) {
    this.sortBy.set(sort);
  }
}
