import {Component, OnDestroy, OnInit} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {Subscription} from 'rxjs';
import {MainService} from '../shared/services/main.service';
import {ClockService} from '../shared/services/clock.service';
import {Router} from '@angular/router';
import {CategoryItem} from '../categories/categories.component';
import {StorageService} from '../shared/services/storage.service';
import {AuthService} from '../shared/services/auth.service';

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
  categories: CategoryItem[] = []
  initialCategories: CategoryItem[] = []
  showCategories = false

  clickClock = 'start'
  sub: Subscription

  constructor(
    public router: Router,
    public mainService: MainService,
    private clockService: ClockService,
    public storageService: StorageService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    let advert = window.location.pathname.includes('addProduct')? '1': null
    let userId = window.location.pathname.includes('cabinet')? this.authService.getUserId(): null

    this.sub = this.mainService.getShopInfo()
      .subscribe(
        (res) => {
          this.mainService.getFonPictures()
          this.mainService.getCategories(userId, advert).subscribe((res) => {
            this.categories = res
            this.showCategories = true
          })
        },
        (error) => {
          this.mainService.getErrorFonPicture()
        }
      )

    if(document.getElementById("doc_time")){

      this.clockService.getClock()
      document.getElementById("inner").style.minHeight = `calc(100vh - ${document.getElementById("doc_time").offsetHeight}px - ${document.getElementById("footer").offsetHeight}px - 15px)`;
      window.setTimeout(() => {
        this.clickClock = 'end'
      }, 3000)
    }

    this.initialCategories = this.storageService.breadcrumbFlag? this.storageService.getCategories(): []
    this.storageService.breadcrumbFlag = false;
  }

  ngAfterViewInit() {
    let action = () => {
      let header = document.getElementsByTagName('header')[0]
      const height = header.clientHeight
      document.getElementById("inner").style.paddingTop = `${height + 20}px`
    }
    window.onresize = action
    action()
  }

  ngOnDestroy(){
    if(this.sub){
      this.sub.unsubscribe()
    }
  }

  onCategoriesClick(items: CategoryItem[]) {this.storageService.setCategories(items)
    // items[-1].txt = 'hello'
    this.mainService.saveCategoriesToStorage(items)
    const item = items.pop()
    this.router.navigate([`${window.location.pathname}/categories/${item.id}/products`])
  }
}


