import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Router} from '@angular/router'

import {AuthService} from '../shared/services/auth.service'
import {MainService} from '../shared/services/main.service'

export interface CatalogItem {
  cust_id: number
  id: number
  isshow: "1"
  listInnerCat: CatalogItem[]
  parent_id: number
  picture: string
  txt: string
}

interface SelectedItem {
  [key: string]: CatalogItem
}

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  catalog: CatalogItem[]
  selected: SelectedItem = {}
  loaded = false

  @Input() showCatalog = true
  @Input() initialCategories = []

  @Output() lastChildAction = new EventEmitter<CatalogItem[]>()

  constructor(private router: Router,
              private authService: AuthService,
              private mainService: MainService) {

                let advert = window.location.pathname.includes('addProduct')? '1': null
                let userId = window.location.pathname.includes('cabinet')? this.authService.getUserId(): null

                this.mainService.getShopInfo().subscribe( (res) => {
                  this.mainService.getCategories(userId, advert).subscribe((res) => {
                    this.catalog = res
                    this.loaded = true
                  })
                })

  }

  ngOnInit() {
    const categories = this.initialCategories
    let index = 1
    for(const x of categories) {
      this.selected['lavel' + index] = x
      index++
    }
  }

  select(type: string, item: CatalogItem, $event) {
    this.selected[type] = (this.selected[type] === item ? null : item)
    $event ? $event.stopPropagation() : null

    // action on last child
    if(item.listInnerCat.length == 0){
      // this.showCatalog = false

      // convert item object to array
      let items: CatalogItem[] = []
      for(const x in this.selected) {
        items.push(this.selected[x])
        if (type === x) {
          break
        }
      }
      this.mainService.saveCategoriesToStorage(items)
      this.lastChildAction.emit(items)
    }
  }

  isActive(type: string, item: CatalogItem) {
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
