import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { environment } from "../../../environments/environment"
import { MainService } from '../../shared/services/main.service';
import { Http, RequestOptions } from '@angular/http';
import { Message } from '../../shared/models/message.model';
import { Subscription } from 'rxjs';
import { Product } from '../../shared/interfaces';
import { OrderService } from '../../shared/services/order.service';

@Component({
  selector: 'app-detail-page',
  templateUrl: './detail-page.component.html',
  styleUrls: ['./detail-page.component.scss']
})
export class DetailPageComponent implements OnInit {

  apiRoot
  element = {
    additionalImages: []
  }
  appCode
  showDescription = true
  showProduct = false
  showSpinner = true
  showAdditionalImages = true
  additionalImages = []
  showEdit = false
  showBasket = false

  elCurrentId: string
  nextElementId
  prevElementId
  allGallery = []

  elementImage_Base

  message: Message
  sub: Subscription

  showPrevElementId = false
  showNextElementId = false

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
    private orderService: OrderService) {}

  ngOnInit() {
    this.apiRoot = environment.api
    this.message = new Message('danger', '')
    let cid

    if(window.location.pathname.includes('cabinet')){
      this.showEdit = true
      this.showBasket = false
      cid = localStorage.getItem('userId')
    }
    else{
      this.showEdit = false
      this.showBasket = true
      cid = ''
    }

    this.mainService.getShopInfo().subscribe((res) => {
      this.appCode = res.cust_id

      this.mainService.getProducts(this.route.snapshot.params['id'], res.cust_id, cid).subscribe((res) => {
        this.allGallery = res
        if(this.route.snapshot.params['idProduct'] == this.allGallery[0].prc_ID){
          this.showPrevElementId = false
        }
        else{
          this.showPrevElementId = true
        }

        if(this.route.snapshot.params['idProduct'] == this.allGallery[this.allGallery.length-1].prc_ID){
          this.showNextElementId = false          
        }
        else{          
          this.showNextElementId = true
        }
      })

      this.mainService.getProduct(this.route.snapshot.params.idProduct, res.cust_id, res.cust_id).subscribe(
        (res: any) => {
          this.element = res
          this.elementImage_Base = res.t_imageprev
          this.showProduct = true
          if(this.element.additionalImages.length > 3 ){
            this.showAdditionalImages = true
            this.additionalImages = this.element.additionalImages.slice(0,3)
          }
          else{
            this.showAdditionalImages = false
            this.additionalImages = this.element.additionalImages
          }
          this.showSpinner = false
        })
      })



  }

  private showMessage( text: string, type:string = 'danger'){
    this.message = new Message(type, text);
    window.setTimeout(() => {
      this.message.text = ''
    }, 2000)
  }

  close(el){
    if(window.location.pathname.includes('cabinet')){
      this.router.navigate([`/cabinet/categories/${el.id}/products`])
    }
    else{
      this.router.navigate([`/categories/${el.id}/products`])
    }
  }

  showDetail(el){
    let a = document.getElementById('show_description')
    a.className = 'description show'
    this.showDescription = false
  }

  editProduct(el){
    this.router.navigate(['/cabinet/categories', el.id, 'products', el.prc_ID, 'edit'])
  }

  deleteProduct(el: Product){
    this.showSpinner = true
    this.mainService.deleteProduct(el).subscribe(
      (res) => {
        this.showSpinner = false
        this.showMessage('Товар был успешно удален', 'success')
        this.router.navigate(['/'])
      }
    )
  }

  mouseOverImg(el){
    this.elementImage_Base = el.t_image
  }

  mouseLeaveImg(el){
    this.elementImage_Base = el.t_imageprev
  }

  routeNextProduct(el){

    this.showPrevElementId = true

    this.showSpinner = true
    if(this.elCurrentId == undefined){
      this.elCurrentId = el.prc_ID
    }

    for(var i=0; i<this.allGallery.length-1; i++){
      if(this.elCurrentId == this.allGallery[i].prc_ID){
        this.nextElementId = this.allGallery[i+1].prc_ID
        if(window.location.href.includes('cabinet')){
          this.router.navigate(['/cabinet', 'categories', this.allGallery[i+1].id, 'products', this.allGallery[i+1].prc_ID])
        }
        else{
          this.router.navigate(['/categories', this.allGallery[i+1].id, 'products', this.allGallery[i+1].prc_ID])
        }
      }
    }

    this.elCurrentId = this.nextElementId

    this.mainService.getProduct(this.nextElementId, this.appCode, this.appCode).subscribe(
      (res: any) => {
          this.element = res
          this.elementImage_Base = res.t_imageprev
          if(this.element.additionalImages.length > 3 ){
            this.showAdditionalImages = true
            this.additionalImages = this.element.additionalImages.slice(0,3)
          }
          else{
            this.showAdditionalImages = false
            this.additionalImages = this.element.additionalImages
          }
          this.showSpinner = false
      }
    )

  }

  routePrewProduct(el){

    this.showNextElementId = true
    this.showSpinner = true

    if(this.elCurrentId == undefined){
      this.elCurrentId = el.prc_ID
    }
    for(var i=0; i<this.allGallery.length; i++){
      if(this.elCurrentId == this.allGallery[i].prc_ID){

        this.prevElementId = this.allGallery[i-1].prc_ID
        if(window.location.href.includes('cabinet')){
          this.router.navigate(['/cabinet', 'categories', this.allGallery[i-1].id, 'products', this.allGallery[i-1].prc_ID]);
        }
        else{
          this.router.navigate(['/categories', this.allGallery[i-1].id, 'products', this.allGallery[i-1].prc_ID]);
        }

      }
    }
    this.elCurrentId = this.prevElementId

    this.mainService.getProduct(this.prevElementId, this.appCode, this.appCode).subscribe(
      (res: any) => {
          this.element = res
          this.elementImage_Base = res.t_imageprev
          if(this.element.additionalImages.length > 3 ){
            this.showAdditionalImages = true
            this.additionalImages = this.element.additionalImages.slice(0,3)
          }
          else{
            this.showAdditionalImages = false
            this.additionalImages = this.element.additionalImages
          }
          this.showSpinner = false
      }
    )

  }

  addToCart(el){

    this.showSpinner = true;

    for(var i = 0;i < this.allGallery.length; i++){
      if(el.id == this.allGallery[i].id){
        if(this.allGallery[i].strike){
          this.allGallery[i].strike = false;
        }
        else{
          this.allGallery[i].strike = true;
        }
        break;
      }
    }

    this.orderService.addToOrder(el);
    this.orderService.doClick();  

    this.mainService.getShopInfo().subscribe(res => {

      this.mainService.getProduct(el.prc_ID, res.cust_id, res.cust_id)  
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
            "OrdTtl_Id" : window.localStorage.getItem('ord_Id'),
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
                this.showProduct = false;   
              }
          })      
        
      })
    })


  }

}
