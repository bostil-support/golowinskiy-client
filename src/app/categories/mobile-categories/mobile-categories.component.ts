import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CategoryItem} from '../categories.component';
import {StorageService} from '../../shared/services/storage.service';

@Component({
  selector: 'app-mobile-categories',
  templateUrl: './mobile-categories.component.html',
  styleUrls: ['./mobile-categories.component.scss']
})
export class MobileCategoriesComponent implements OnInit {
  private selectedCategories: CategoryItem[] = [];
  @Input() initialCategories: CategoryItem[] = [];
  @Input() categories: CategoryItem[] = [];
  @Output() lastChildAction = new EventEmitter<CategoryItem[]>();

  constructor(
    private storageService: StorageService,
  ) {
    this.storageService.selectedCategories.subscribe(value => {
      this.selectedCategories = value;
    });
  }

  ngOnInit() {
    // load selected categories if redirect over breadcrumbs
    this.selectedCategories = this.initialCategories;
   setTimeout(()=>console.log(this.categories),2000);
  }

  click(level: number, item: CategoryItem) {
    const oldCategory = this.selectedCategories[level]
    if (oldCategory !== undefined) {
   //   if(level == 0)
   //   this.selectedCategories.splice(level, 10, item);
   //   else
      this.selectedCategories.splice(level, 10);
    } else {
      this.selectedCategories.splice(level, 10, item);
    }
    if (item.listInnerCat.length === 0) {
      if(!this.isEqual(oldCategory, item)) {
        this.lastChildAction.emit(this.selectedCategories);
      }
    }

    // share categories
    this.storageService.selectedCategories.next(this.selectedCategories);
  }

  firstLoad: boolean  = false;
  isShowItem(level: number, item: CategoryItem): boolean {  
    const selected = this.selectedCategories[level];
    const res = selected === undefined || this.isEqual(selected, item);
    if(level !==0){
      return res
    }else{
      return true  
    }
  }

  isShowSubitems(level: number, item: CategoryItem): boolean {
    return this.isEqual(this.selectedCategories[level], item);
  }

  isSelected(level: number, item: CategoryItem): boolean {
    return this.isEqual(this.selectedCategories[level], item);
  }

  isEqual(item1?: CategoryItem, item2?: CategoryItem): boolean {
    return (item1 && item1.id) === (item2 && item2.id);
  }
}
