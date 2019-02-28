import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, NavigationStart, ResolveStart, Router} from '@angular/router';

import { Http } from '@angular/http';
import { OrderService } from '../../shared/services/order.service';
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

  clickCount;
  clickSum;
  custID
  ctlg_No: string;
  ctlg_Name: string;
  sup_ID: string;
  prc_ID: string;  

  sumOrder;
  kolOrder;
  price: number;
  count: number;
  articul: any;
  quantity;
  prc_Br;
  tName;
  kolItems;
  ord_Id: string;

  constructor(private mainService: MainService,
              private route: ActivatedRoute,
              private router: Router,
              private orderService: OrderService,
              private storageService: StorageService) {
                this.orderService.onClickSum.subscribe(cnt=>this.clickSum = cnt);
                this.orderService.onClick.subscribe(cnt=>this.clickCount = cnt);
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

  pageChange(event) {
  }

  addToCart(el){

    this.showSpinner = true;
    this.orderService.addToOrder(el);   
    this.clickCount = this.orderService.countKol();
    this.clickSum = this.orderService.countSum();

    this.mainService.getShopInfo().subscribe(
   
      (res) => {
        this.custID = res;
        
        this.mainService.getProduct(el.prc_ID, this.custID, res.cust_id)  
        .subscribe(
          (res: any) => {
            this.ctlg_No = res.ctlg_No;  
            this.ctlg_Name = res.ctlg_Name;  
            this.sup_ID = res.sup_ID;
            this.tName = res.tName;
            this.prc_Br = this.prc_Br;
    
            if(window.localStorage.getItem('kolItems')){
              this.kolItems = window.localStorage.getItem('kolItems');
            }
            else{
              this.kolItems = 1;
            }

            let data = {
              "OrdTtl_Id" : this.ord_Id,
              "OI_No" : +this.kolItems,
              "Ctlg_No": this.ctlg_No,
              "Qty": this.quantity,
              "Ctlg_Name": this.ctlg_Name,
              "Sup_ID": this.sup_ID,
              "Descr": this.tName
            }

            this.mainService.addToCart(data)
            .subscribe(
              (res: any) => {    
                this.showSpinner = false;            
                if(res.result == true){  
                  this.showMessage(`${res.message}`, 'success');
                }
            })      
          
        })

    
    })
    

  }

}
