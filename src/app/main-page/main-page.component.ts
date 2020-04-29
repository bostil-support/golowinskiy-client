import {Component, OnDestroy, OnInit, HostListener} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {Subscription} from 'rxjs';
import {MainService} from '../shared/services/main.service';
import {ClockService} from '../shared/services/clock.service';
import {Router} from '@angular/router';
import {CategoryItem} from '../categories/categories.component';
import {StorageService} from '../shared/services/storage.service';
import {AuthService} from '../shared/services/auth.service';
import {CategoriesService} from '../shared/services/categories.service';
import { EnvService } from '../env.service';

@Component({
  selector: 'main-page.component',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
  animations: [
    trigger('hideClock', [
      state('start', style({
        opacity: '1'
      })),
      state('end', style({
        opacity: '0'
      })),
      transition('start => end', animate('1000ms 0.5s ease-out'))
    ])
  ]
})
export class MainPageComponent implements OnInit, OnDestroy {
  initialCategories: CategoryItem[] = []

  clickClock = 'start'
  sub: Subscription

  constructor(
    public router: Router,
    public mainService: MainService,
    private clockService: ClockService,
    public storageService: StorageService,
    private authService: AuthService,
    private categoriesService: CategoriesService,
    private env: EnvService
  ) {
  
   }

  @HostListener('document:scroll', ['$event']) 
    onWindowScroll(event){
  //   console.log(event)
  }
  ngOnInit() {
    this.sub = this.mainService.getShopInfo()
      .subscribe(
        (res) => {
          this.mainService.getFonPictures();
          if (this.isCabinet()) {
            this.categoriesService.fetchCategoriesUser(res.cust_id)
          } else {
            this.categoriesService.fetchCategoriesAll(res.cust_id)
          }
        },
        (error) => {
          alert(error.error.message)
        //  this.mainService.getErrorFonPicture()
        }
      )

    this.initialCategories = this.storageService.breadcrumbFlag? this.storageService.getCategories(): []
    this.storageService.breadcrumbFlag = false;
  }

  ngAfterViewInit() {
    setTimeout(()=>window.scrollTo(0,0), 500); 
    let action = () => {
      let header = document.getElementsByTagName('header')[0]
      const height = header.clientHeight
      document.getElementById("inner").style.paddingTop = `${height + 20}px`
    }
    window.onresize = action
    action()

    if(document.getElementById("doc_time")){
      this.clockService.getClock()
      document.getElementById("inner").style.minHeight = `calc(100vh - ${document.getElementById("doc_time").offsetHeight}px - ${document.getElementById("footer").offsetHeight}px - 15px)`;
      window.setTimeout(() => {
        this.clickClock = 'end'
      }, 3000)
    }
  }

  ngOnDestroy(){
    if(this.sub){
      this.sub.unsubscribe()
    }
  }

  isCabinet(): boolean {
    return window.location.pathname.includes('cabinet');
  }

  onCategoriesClick(items: CategoryItem[]) {
    this.storageService.setCategories(items)
    this.mainService.saveCategoriesToStorage(items)
    const item = items[items.length - 1]
    this.router.navigate([`${window.location.pathname}/categories/${item.id}/products`])
  }
}


