import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {environment} from '../../../environments/environment';
import {MainService} from '../../shared/services/main.service';
import {Message} from '../../shared/models/message.model';
import {of, Subscription} from 'rxjs';
import {DeleteProduct, Product} from '../../shared/interfaces';
import {OrderService} from '../../shared/services/order.service';
import {AuthService} from '../../shared/services/auth.service';
import {Location} from '@angular/common';
import { EnvService } from 'src/app/env.service';
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
  quantity = 1;
  prc_Br;
  tName;
  kolItems;
  ord_Id: string;
  loadingImage = "data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==";
  dataForDeleteItem: DeleteProduct = null;
  constructor(private mainService: MainService,
    private route: ActivatedRoute,
    private router: Router,
    public orderService: OrderService,
    private location : Location,
    private authService: AuthService,
    private env: EnvService) {
      this.apiRoot = this.env.apiUrl;
    }

  ngOnInit() {
    this.message = new Message('danger', '')
    this.prc_ID = this.route.snapshot.params.idProduct
    let cid

    if(window.location.pathname.includes('cabinet')){
      this.showEdit = true
      this.showBasket = false
      cid = localStorage.getItem('userId')
    }
    else{
      this.showEdit = false
      this.showBasket = true
      cid = '';
    }

    this.mainService.getShopInfo().subscribe((res) => {
      this.appCode = res.cust_id;
      this.dataForDeleteItem = {
        cid: this.authService.getUserId(),
        appCode: this.appCode,
        cust_ID: res.cust_id,
        prc_ID: this.prc_ID,
      }
      if(this.mainService.productsByCategoryId.length == 0){
        this.mainService.getProducts(this.route.snapshot.params['id'], this.appCode, cid).subscribe((res) => {
          res.forEach((element,i) => {
            this.allGallery.push({i, prc_ID: element.prc_ID, src: this.apiRoot + '/api/Img?AppCode=' + this.appCode + '&ImgFileName=' + element.image_Base, default: this.apiRoot + '/api/Img?AppCode=' + this.appCode + '&ImgFileName=' + element.image_Base, name: element.image_Base})
          });
          this.setSliderImageById(this.route.snapshot.params['idProduct']);
          this.showPrevElementId = this.route.snapshot.params['idProduct'] != this.allGallery[0].prc_ID;
          this.showNextElementId = this.route.snapshot.params['idProduct'] != this.allGallery[this.allGallery.length - 1].prc_ID;
        })
      }else{
        this.allGallery = this.mainService.productsByCategoryId;
        this.setSliderImageById(this.route.snapshot.params['idProduct']);
        this.showPrevElementId = this.route.snapshot.params['idProduct'] != this.allGallery[0].prc_ID;
        this.showNextElementId = this.route.snapshot.params['idProduct'] != this.allGallery[this.allGallery.length - 1].prc_ID;
      }
      
      this.showSpinner = true;
      this.getProduct(this.route.snapshot.params.idProduct);
      }, error=>alert(error.error.message))
  }

  getProduct(productId){
    this.showSpinner = true;
    this.showProduct = false;
    this.mainService.getProduct(productId, this.appCode, this.appCode).subscribe(
      (res: any) => {
        this.element = res
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
    });
  }

  mainImageIndex: number = 0;
  setSliderImageById(id){
    this.updateUrl(id);
    const mainImageName = this.allGallery.filter(item => item.prc_ID == id)[0].name;
    if(mainImageName)
      this.elementImage_Base = mainImageName;
    else
      alert('main image not found in stack');
  }

  updateUrl(productId: number){
    const replacePatch = window.location.pathname.includes('cabinet') ? `/cabinet/categories/${this.route.snapshot.params['id']}/products/${productId}` : `/categories/${this.route.snapshot.params['id']}/products/${productId}`;
    const url = this.location.path().replace(this.location.path(), replacePatch);
    this.location.go(url);
  }

  currentPosition: number = 0;
  goLeft(){
    this.currentPosition = this.currentPosition >=0 ? this.currentPosition-=1 : 0;
    this.additionalImages = this.element.additionalImages.slice(this.currentPosition,3 + this.currentPosition);
  }
  goRight(){
    const lastItem: number = this.element.additionalImages.length - 3;
    this.currentPosition = this.currentPosition < lastItem ? this.currentPosition+1 : lastItem;
    this.additionalImages = this.element.additionalImages.slice(this.currentPosition,3 + this.currentPosition);
  }
  private showMessage( text: string, type:string = 'danger'){
    this.message = new Message(type, text);
    window.setTimeout(() => {
      this.message.text = ''
    }, 2000)
  }

  close(){
    if(window.location.pathname.includes('cabinet')){
      this.router.navigate([`/cabinet/categories/${this.route.snapshot.params['id']}/products`])
    }
    else{
      this.router.navigate([`/categories/${this.route.snapshot.params['id']}/products`])
    }
  }

  showDetail(){
    let a = document.getElementById('show_description')
    a.className = 'description show'
    this.showDescription = false
  }

  editProduct(el){
    this.router.navigate(['/cabinet/categories', el.id, 'products', el.prc_ID, 'edit'])
  }

  deleteProduct(){
    this.showSpinner = true
      this.mainService.deleteProduct(this.dataForDeleteItem).subscribe(
        (res) => {
          this.showSpinner = false
          if(res)
            this.showMessage('Товар был успешно удален', 'success')
          else
            this.showMessage('Произошла ошибка удаления товара', 'success')
          this.close();
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
    this.showPrevElementId = true;
    this.showSpinner = true;
    if(this.elCurrentId == undefined){
      this.elCurrentId = el.prc_ID
    }

    for(var i=0; i<this.allGallery.length-1; i++){
      if(this.elCurrentId == this.allGallery[i].prc_ID){
        this.nextElementId = this.allGallery[i+1].prc_ID
        this.showNextElementId =  !!this.allGallery[i+2];
        this.setSliderImageById(this.nextElementId)
        this.getProduct(this.nextElementId);
      }
    }

    this.elCurrentId = this.nextElementId

  //  this.getProduct(this.nextElementId)

  }
  showFullDescription: boolean = false;
  limitDescription: number = 120;
  limiter = (text: string) => text ? text.length > this.limitDescription && !this.showFullDescription ? text.substring(0, this.limitDescription) + '...' : text : '';
  showDescrButton = () => this.showFullDescription = !this.showFullDescription;

  routePrewProduct(el){
    this.showNextElementId = true
    this.showSpinner = true
    if(this.elCurrentId == undefined){
      this.elCurrentId = el.prc_ID
    }
    for(var i=0; i<this.allGallery.length; i++){
      if(this.elCurrentId == this.allGallery[i].prc_ID){
        this.prevElementId = this.allGallery[i-1].prc_ID;
        this.showPrevElementId = !!this.allGallery[i-2];
        this.setSliderImageById(this.prevElementId)
        this.getProduct(this.prevElementId);
      }
      
    }
    this.elCurrentId = this.prevElementId
  //  this.getProduct(this.prevElementId);
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

    this.orderService.doClick();

    let registerOrder = this.orderService.countKol() === 0? this.mainService.registerOrder(): of({});
    registerOrder.subscribe(() => {
      this.mainService.getShopInfo().subscribe(res => {

        this.mainService.getProduct(el.prc_ID, res.cust_id, res.cust_id)
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

              let registerData = {
                Cust_ID: this.authService.getUserId(),
                Cur_Code: 810
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
                .subscribe(
                  (res: any) => {
                    this.showSpinner = false;

                    if (res.result == true) {
                      this.orderService.addToOrder(el, productRes.ctlg_No, productRes.ctlg_Name, productRes.sup_ID);
                      this.showMessage(`${res.message}`, 'success');
                      this.showProduct = false;
                    }
                  })
            })
      }, error=>alert(error.error.message))
    })
  }

}
