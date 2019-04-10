import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CategoryItem} from '../categories.component';
import {StorageService} from '../../shared/services/storage.service';

@Component({
  selector: 'app-mobile-categories',
  templateUrl: './mobile-categories.component.html',
  styleUrls: ['./mobile-categories.component.scss']
})
export class MobileCategoriesComponent implements OnInit {
  private selectedCategories: CategoryItem[] = []
  @Input() initialCategories: CategoryItem[] = []
  @Input() categories: CategoryItem[] = []
  @Output() lastChildAction = new EventEmitter<CategoryItem[]>()

  constructor(
      private storageService: StorageService,
    ) {
    this.storageService.selectedCategories.subscribe(value => {
      this.selectedCategories = value
    })
  }

  ngOnInit() {
    // load selected categories if redirect over breadcrumbs
    this.selectedCategories = this.initialCategories
  }

  click(level: number, item: CategoryItem) {
    if (item.listInnerCat.length === 0) {
      this.selectedCategories.push(item)
      this.lastChildAction.emit(this.selectedCategories)
    } else {
      if (this.selectedCategories[level] !== undefined) {
        this.selectedCategories.splice(level, 10)
      } else {
        this.selectedCategories.splice(level, 10, item)
      }
    }
    // share categories
    this.storageService.selectedCategories.next(this.selectedCategories)
  }

  isShowItem(level: number, item: CategoryItem): boolean {
    const selected = this.selectedCategories[level];
    return selected === undefined || this.isEqual(selected, item);
  }

  isShowSubitems(level: number, item: CategoryItem): boolean {
    return this.isEqual(this.selectedCategories[level], item)
  }

  isSelected(level: number, item: CategoryItem): boolean {
    return this.isEqual(this.selectedCategories[level], item)
  }

  isEqual(item1?: CategoryItem, item2?: CategoryItem): boolean {
    return (item1 && item1.id) === (item2 && item2.id)
  }
}
