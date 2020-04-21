import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {OrderService} from '../../shared/services/order.service';
import {environment} from '../../../environments/environment';
import {MainService} from '../../shared/services/main.service';
import {Message} from 'src/app/shared/models/message.model';
import {of, Subscription} from 'rxjs';
import {StorageService} from '../../shared/services/storage.service';
import {AuthService} from '../../shared/services/auth.service';
import {CategoryItem} from '../../categories/categories.component';
import {CategoriesService} from '../../shared/services/categories.service';

@Component({
  selector: 'app-products-page',
  templateUrl: './products-page.component.html',
  styleUrls: ['./products-page.component.scss']
})
export class ProductsPageComponent implements OnInit, OnDestroy {

  Gallery = []
  apiRoot
  showSpinner = true
  categories: CategoryItem[] = []

  message: Message
  sub: Subscription

  //pagination
  currentPage = 1;
  itemsPerPage = 15;

  clickCount
  clickSum
  cid: string = null
  custID: string
  ctlg_No: string
  ctlg_Name: string
  sup_ID: string
  prc_ID: string

  price: number
  prc_Br
  tName
  kolItems

  constructor(private mainService: MainService,
              private route: ActivatedRoute,
              private router: Router,
              public orderService: OrderService,
              private storageService: StorageService,
              private authService: AuthService,
              private categoriesService: CategoriesService,
  ) {
    this.orderService.onClickSum.subscribe(cnt=>this.clickSum = cnt)
    this.orderService.onClick.subscribe(cnt=>this.clickCount = cnt)
  }

  ngOnInit() {
    this.categories = this.mainService.loadCategoriesFromStorage()
    this.message = new Message('danger', '')
    this.apiRoot = environment.api
    this.cid = this.isCabinet()? localStorage.getItem('userId'): ''
    this.sub = this.mainService.getShopInfo().subscribe(
      (res) => this.request(res.cust_id),
      (error) => {
        alert(error.error.message)
        this.mainService.getErrorFonPicture()
      }
    )
  }
  idPortal = null;
  request(idPortal) {
    this.idPortal = idPortal;
    this.mainService.getProducts(this.route.snapshot.params['id'], this.mainService.getCustId(), this.cid).subscribe((res) => {
      this.Gallery = res;
      if(this.mainService.productsByCategoryId.length == 0)
      res.forEach((element, i) => {
        this.mainService.productsByCategoryId.push({i, prc_ID: element.prc_ID, src: this.apiRoot + 'Img?AppCode=' + this.mainService.getCustId() + '&ImgFileName=' + element.image_Base, default: this.apiRoot + 'Img?AppCode=' + this.mainService.getCustId() + '&ImgFileName=' + element.image_Base, name: element.image_Base})
      });
      this.showSpinner = false
    })
    this.mainService.getFonPictures()
    if(this.isCabinet()) {
      this.categoriesService.fetchCategoriesUser(idPortal)
    } {
      this.categoriesService.fetchCategoriesAll(idPortal)
    }
  }

  ngAfterViewInit() {
    const action = () => {
      const header = document.getElementsByTagName('header')[0]
      const height = header.clientHeight
      document.getElementById('main-content').style.paddingTop = `${height + 20}px`
    }
    window.onresize = action
    action()
  }

  ngOnDestroy(){
    if(this.sub){
      this.sub.unsubscribe()
    }
  }

  private isCabinet(): boolean {
    return window.location.pathname.includes('cabinet')
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
    this.router.navigate([this.router.url.includes('cabinet')? '/cabinet': '/'])
  }

  addToCart(el){
    this.showSpinner = true;
    this.clickCount = this.orderService.countKol();
    this.clickSum = this.orderService.countSum();

    let registerOrder = this.orderService.countKol() === 0? this.mainService.registerOrder(): of({})

    registerOrder.subscribe(() => {
      this.mainService.getShopInfo().subscribe((res) => {
          this.custID = res.cust_id;

          this.mainService.getProduct(el.prc_ID, this.custID, res.cust_id)
            .subscribe((productRes: any) => {
                this.ctlg_No = productRes.ctlg_No;
                this.ctlg_Name = productRes.ctlg_Name;
                this.sup_ID = productRes.sup_ID;
                this.tName = productRes.tName;
                this.prc_Br = productRes.prc_Br;

                if (window.localStorage.getItem('kolItems')) {
                  this.kolItems = window.localStorage.getItem('kolItems');
                } else {
                  this.kolItems = 1;
                }

                let data = {
                  "OrdTtl_Id": this.orderService.getOrderId(),
                  "OI_No": this.orderService.countKol() + 1,
                  "Ctlg_No": productRes.ctlg_No,
                  "Qty": 1,
                  "Ctlg_Name": productRes.ctlg_Name,
                  "Sup_ID": productRes.sup_ID,
                  "Descr": productRes.tName,
                }
                this.mainService.addToCart(data)
                  .subscribe((res: any) => {
                      this.showSpinner = false;
                      if (res.result == true) {
                        this.orderService.addToOrder(el, productRes.ctlg_No, productRes.ctlg_Name, productRes.sup_ID)
                        this.showMessage(`${res.message}`, 'success');
                      }
                    })

              })
        }, error=>alert(error.error.message))
    })
  }

  navigateToCategory (items: CategoryItem[]) {
    this.mainService.saveCategoriesToStorage(items)
    const item = items[items.length - 1]
    const cabinet = this.isCabinet()? '/cabinet': ''
    this.router.navigate([`${cabinet}/categories/${item.id}/products`]).then(succeeded => {
      if (succeeded) {
        this.showSpinner = true
        this.request(this.idPortal);
      }
    })
  }
}
