import {Injectable} from '@angular/core';
import {CategoryItem} from '../../categories/categories.component';
import {Subject} from 'rxjs';

// service for runtime storage
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  // used for save selected categories after breadcrumbs click
  private categories: CategoryItem[] = []
  private _breadcrumbFlag = false;
  // used for sync selected categories between categories component and mobile component
  public selectedCategories: Subject<CategoryItem[]> = new Subject<CategoryItem[]>()

  setCategories(categories: CategoryItem[]) {
    this.categories = categories || []
  }

  getCategories(): CategoryItem[] {
    return this.categories
  }

  public get breadcrumbFlag() {
    return this._breadcrumbFlag;
  }

  public set breadcrumbFlag(flag: boolean) {
    this._breadcrumbFlag = flag;
  }
}
