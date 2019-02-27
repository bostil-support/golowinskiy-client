import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { environment } from "../../../environments/environment"
import { MainService } from '../../shared/services/main.service';
import { Http, RequestOptions } from '@angular/http';
import { Message } from '../../shared/models/message.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-detail-page',
  templateUrl: './detail-page.component.html',
  styleUrls: ['./detail-page.component.scss']
})
export class DetailPageComponent implements OnInit {

  apiRoot
  element
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
  Gallery = []

  elementImage_Base

  message: Message
  sub: Subscription

  constructor(private mainService: MainService,
    private route: ActivatedRoute,
    private router: Router) {}              

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
        this.Gallery = res      
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

  mouseOverImg(el){
    this.elementImage_Base = el.t_image
  }

  mouseLeaveImg(el){
    this.elementImage_Base = el.t_imageprev
  }

  routeNextProduct(el){

    this.showSpinner = true    
    if(this.elCurrentId == undefined){
      this.elCurrentId = el.prc_ID
    }

    for(var i=0; i<this.Gallery.length-1; i++){ 
      if(this.elCurrentId == this.Gallery[i].prc_ID){
        this.nextElementId = this.Gallery[i+1].prc_ID 
        if(window.location.href.includes('cabinet')){
          this.router.navigate(['/cabinet', 'categories', this.Gallery[i+1].id, 'products', this.Gallery[i+1].prc_ID])                    
        }  
        else{
          this.router.navigate(['/categories', this.Gallery[i+1].id, 'products', this.Gallery[i+1].prc_ID])                    
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
    if(this.elCurrentId == undefined){
      this.elCurrentId = el.prc_ID
    }  
    for(var i=0; i<this.Gallery.length; i++){
      if(this.elCurrentId == this.Gallery[i].prc_ID){       
       
        this.prevElementId = this.Gallery[i-1].prc_ID
        if(window.location.href.includes('cabinet')){
          this.router.navigate(['/cabinet', 'categories', this.Gallery[i-1].id, 'products', this.Gallery[i-1].prc_ID]);                    
        }  
        else{
          this.router.navigate(['/categories', this.Gallery[i-1].id, 'products', this.Gallery[i-1].prc_ID]);                    
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

}
