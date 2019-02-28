import {Injectable} from '@angular/core';
import {CategoryItem} from '../../categories/categories.component';

// service for runtime storage
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private categories: CategoryItem[] = []
  public breadcrumbFlag = false;

  setCategories(categories: CategoryItem[]) {
    this.categories = categories || []
  }

  getCategories(): CategoryItem[] {
    return this.categories
  }
}
