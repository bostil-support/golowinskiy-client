import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Router} from '@angular/router'

import {AuthService} from '../shared/services/auth.service'
import {MainService} from '../shared/services/main.service'
import {StorageService} from '../shared/services/storage.service';
import { CategoriesService } from '../shared/services/categories.service';
import { Observable } from 'rxjs';

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
  loadingImage = "data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==";
  isCategoriesLoaded: Observable<boolean>;
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
              private storageService: StorageService,
              private categoryService: CategoriesService
  ) {
    storageService.selectedCategories.subscribe(value => {
      for (let i = 0; i < value.length; i++) {
        this.selected['lavel' + (i + 1)] = value[i]
      }
    });
    this.isCategoriesLoaded = this.categoryService.isCategoriesLoaded();
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
   previous_level: number = null;
  select(level: number, item: CategoryItem, event) {
    event.stopPropagation()
    if (item.listInnerCat.length === 0) {
      if(this.previous_level !== level){
        this.previous_level = level;
        this.selectedCategories.push(item);
        this.lastChildAction.emit(this.selectedCategories);
      }else{
        this.selectedCategories[this.selectedCategories.length -1] = item;
        this.lastChildAction.emit(this.selectedCategories);
      }
    } else {
      if (this.isEqual(this.selectedCategories[level], item)) {
        this.previous_level = level;
        this.selectedCategories.length = 0;
      } else {
        this.previous_level = level;
        this.selectedCategories.splice(level, this.selectedCategories.length, item)
      }
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
