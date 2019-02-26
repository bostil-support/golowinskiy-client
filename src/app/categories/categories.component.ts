import { Component, OnInit, EventEmitter, Output } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router';

import { AuthService } from '../shared/services/auth.service';
import { MainService } from '../shared/services/main.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {

  catalog
  selected = {}

  showCatalog = false
  clickCount
  clickCnt: string = null

  items = []

  selectedRows = []

  constructor(private router: Router,
              private authService: AuthService,
              private mainService: MainService) { 

                let advert = '1'

                if(window.location.pathname.includes('addProduct')){
                  advert = '1'
                }
                else{
                  advert = null
                }

                let userId
                if(window.location.pathname.includes('cabinet')){
                  userId = this.authService.getUserId()                
                }
                else{
                  userId = null
                }                

                this.mainService.getShopInfo().subscribe( (res) => {
                  this.mainService.getCategories(userId, advert).subscribe((res) => {
                    this.catalog = res
                    this.showCatalog = true
                  })
                })
               
  }

  select(type, item, $event, index) {

    this.selected[type] = (this.selected[type] === item ? null : item)
    $event ? $event.stopPropagation() : null

    if(item.listInnerCat.length == 0){
      this.showCatalog = false      
      
      if(window.location.pathname.includes('addProduct')){ 
      }
      else{
        this.router.navigate([`${window.location.pathname}/categories/${item.id}/products`])
      }      
    }
  }
  isActive(type, item) {
    return this.selected[type] === item
  }


  ngOnInit() {
    
  }


}
