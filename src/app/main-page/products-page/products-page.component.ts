import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, NavigationStart, ResolveStart, Router} from '@angular/router';

import {environment} from '../../../environments/environment';
import {MainService} from '../../shared/services/main.service';
import {Message} from 'src/app/shared/models/message.model';
import {Subscription} from 'rxjs';
import {StorageService} from '../../shared/services/storage.service';

@Component({
  selector: 'app-products-page',
  templateUrl: './products-page.component.html',
  styleUrls: ['./products-page.component.scss']
})
export class ProductsPageComponent implements OnInit, OnDestroy {

  Gallery = []
  apiRoot
  showSpinner = true
  showBasket = false
  categories = []

  message: Message
  sub: Subscription

  //pagination
  currentPage = 1;
  itemsPerPage = 15;

  constructor(
    private mainService: MainService,
    private route: ActivatedRoute,
    private router: Router,
    private storageService: StorageService
  ) {
  }

  ngOnInit() {
    this.categories = this.mainService.loadCategoriesFromStorage()

    this.message = new Message('danger', '')

    this.apiRoot = environment.api

    this.sub = this.mainService.getShopInfo()
      .subscribe(
        (res) => {
          let cid
          if(window.location.pathname.includes('cabinet')){
            cid = localStorage.getItem('userId')
            this.showBasket = false
          }
          else{
            cid = ''
            this.showBasket = true
          }
          this.mainService.getProducts(this.route.snapshot.params['id'], res.cust_id, cid).subscribe((res) => {
            this.Gallery = res
            this.showSpinner = false
          })
          this.mainService.getFonPictures()
        },
        (error) => {
          this.mainService.getErrorFonPicture()
        }
      )

    this.categories = this.mainService.loadCategoriesFromStorage()
  }

  ngOnDestroy(){
    if(this.sub){
      this.sub.unsubscribe()
    }
  }

  private showMessage( text: string, type:string = 'danger'){
    this.message = new Message(type, text);
    window.setTimeout(() => {
      this.message.text = '';
    }, 2000);
  }

  detail(el){
      this.router.navigate([`/${window.location.pathname}/${el.prc_ID}`])
  }

  breadcrumbsClick() {
    this.storageService.setCategories(this.categories)
    this.storageService.breadcrumbFlag = true
    this.router.navigate(['/'])
  }
}
