import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Router} from '@angular/router'

import {AuthService} from '../shared/services/auth.service'
import {MainService} from '../shared/services/main.service'
import {StorageService} from '../shared/services/storage.service';

export interface CategoryItem {
  cust_id: number
  id: number
  isshow: "1"
  listInnerCat: CategoryItem[]
  parent_id: number
  picture: string
  txt: string
}

interface SelectedItem {
  [key: string]: CategoryItem
}

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  _categories: CategoryItem[] = []
  @Input() set categories(categories: CategoryItem[]) {
    this._categories = categories;
    this.recalculate = true;
  }
  selected: SelectedItem = {}
  selectedCategories: CategoryItem[] = []
  recalculate = true;

  @Input() showCatalog = true
  @Input() initialCategories: CategoryItem[] = []

  @Output() lastChildAction = new EventEmitter<CategoryItem[]>()

  constructor(private router: Router,
              private authService: AuthService,
              private mainService: MainService,
              private storageService: StorageService
  ) {
    storageService.selectedCategories.subscribe(value => {
      for (let i = 0; i < value.length; i++) {
        this.selected['lavel' + (i + 1)] = value[i]
      }
    })
  }

  onRedraw() {
    if (this.recalculate) {
      this.recalculateHeight()
    }
  }

  ngOnInit() {
    this.selectedCategories = this.initialCategories.slice(0, -1)
  }

  recalculateHeight() {
    let menu = document.getElementsByClassName('left-menu')[0] as HTMLElement
    let menus = menu.querySelectorAll('ul')
    let height = 0;
    for(let i = 0; i < menus.length; i++) {
      let client = menus[i].clientTop + menus[i].clientHeight;
      if (client > height) {
        height = client
      }
    }
    menu.style.minHeight = `${height + 40}px`
    this.recalculate = false;
  }

  select(level: number, item: CategoryItem, event) {
    event.stopPropagation()
    if (item.listInnerCat.length === 0) {
      this.selectedCategories.push(item)
      this.lastChildAction.emit(this.selectedCategories)
    } else {
      if (this.isEqual(this.selectedCategories[level], item)) {
        this.selectedCategories.splice(level, 10)
      } else {
        this.selectedCategories.splice(level, 10, item)
      }
      // share selected items
      this.storageService.selectedCategories.next(this.selectedCategories)
      this.recalculate = true
    }
  }

  isSelected(level: number, item: CategoryItem): boolean {
    return this.isEqual(this.selectedCategories[level], item)
  }

  isShowSubitems(level: number, item: CategoryItem): boolean {
    return this.isEqual(this.selectedCategories[level], item)
  }

  isEqual(item1?: CategoryItem, item2?: CategoryItem): boolean {
    return (item1 && item1.id) === (item2 && item2.id)
  }
}
