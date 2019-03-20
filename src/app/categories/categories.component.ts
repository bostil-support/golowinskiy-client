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
  @Input() categories: CategoryItem[]
  selected: SelectedItem = {}

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

  ngOnInit() {
    const categories = this.initialCategories
    for (let i = 0; i < categories.length - 1; i++) {
      this.selected['lavel' + (i + 1)] = categories[i]
    }
  }

  select(type: string, item: CategoryItem, $event) {
    this.selected[type] = (this.selected[type] === item ? null : item)
    $event ? $event.stopPropagation() : null

    // convert item object to array
    let items: CategoryItem[] = []
    for(const x in this.selected) {
      items.push(this.selected[x])
      if (type === x) {
        break
      }
    }
    // action on last child
    if(item.listInnerCat.length == 0){
      this.lastChildAction.emit(items)
    }
    // share selected items
    this.storageService.selectedCategories.next(items)
  }

  isActive(type: string, item: CategoryItem) {
    let typeMod = {}
    for(let typeElement in this.selected[type]) {
      if (typeElement != 'listInnerCat') {
        typeMod[typeElement] = this.selected[type][typeElement]
      }
    }
    let itemMod = {}
    for(let itemElement in item) {
      if (itemElement != 'listInnerCat') {
        itemMod[itemElement] = item[itemElement];
      }
    }
    return JSON.stringify(typeMod) === JSON.stringify(itemMod)
  }
}
