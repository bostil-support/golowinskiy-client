import {Component, ElementRef, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Headers} from '@angular/http';
import {FormControl, FormGroup, Validators} from '@angular/forms';

import {AuthService} from 'src/app/shared/services/auth.service';
import {Message} from 'src/app/shared/models/message.model';
import {OrderService} from 'src/app/shared/services/order.service';
import {MainService} from '../../shared/services/main.service';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {

  kol = 0;
  data_form: { "Ord_ID": string | number; "Cust_ID": any; "Addr": any; "Note": any; };
  showProductOrder: boolean = true;

  user: any;

  ord_Id: string = '';
  cart = [];
  qyu: any;
  price = 0;
  sumOrder = 0;

  countP = 1;

  sum = 0;

  showOrder: boolean = false;

  message: Message;
  form: FormGroup;

  showAddOrder: string = 'fa fa-shopping-basket';
  showSpinner: boolean = false;
  idCategorii;

  clickCnt = window.localStorage.getItem('kolItems');
  clickSum = window.localStorage.getItem('sumOrder');

  constructor(
        public el: ElementRef,
        private router: Router,
        private authService: AuthService,
        private route: ActivatedRoute,
        private orderService: OrderService,
        private mainService: MainService
  ) {
    this.orderService.onClick.subscribe(cnt => {
      this.clickCnt = cnt;
    });
    this.orderService.onClickSum.subscribe(cnt => {
      this.clickSum = cnt;
    });
  }

  ngOnInit() {
    this.ord_Id = window.localStorage.getItem('ord_Id');
    this.message = new Message('danger', '');

    this.form = new FormGroup({
      'Addr': new FormControl(null, [Validators.required]),
      'Note': new FormControl(null, [Validators.required])
    });

    this.checkCart();
    if(window.location.pathname!= '/order'){
      this.idCategorii = window.location.pathname.split('categories/')[1].split('/products')[0];

    }


  }

  private showMessage( text: string, type:string = 'danger'){
    this.message = new Message(type, text);
    window.setTimeout(() => {
      this.message.text = '';
      if(this.message.type == 'danger'){
        this.router.navigate(['/auth/login'], { queryParams: {route: this.router.url}})
      }
      else if(this.message.type == 'success'){
        if(window.location.pathname!= '/order'){
          this.router.navigate(['/categories', this.idCategorii, 'products']);
        }
        else{
          this.router.navigate(['/']);
        }
      }
    }, 2000);
  }

  private showMessageOrder( text: string, type:string = 'danger'){
    this.message = new Message(type, text);
    window.setTimeout(() => {
      this.message.text = '';
      if(this.message.type == 'success'){
        this.router.navigate(['/']);
      }
    }, 2000);
  }

  clickCloseProductOrder(){

    if(window.location.pathname!= '/order'){
      this.router.navigate(['/categories', this.idCategorii, 'products']);
    }
    else{
      this.router.navigate(['/']);
    }
    this.showProductOrder = false;


  }

  checkCart(){
    if(window.localStorage.getItem('cart')!= null){
      this.cart = JSON.parse(window.localStorage.getItem('cart'));
    }


    if(JSON.parse(window.localStorage.getItem('sumOrder'))){
      this.sumOrder = JSON.parse(window.localStorage.getItem('sumOrder'));
    }
    else{
      this.sumOrder = 0;
    }

    if(JSON.parse(window.localStorage.getItem('kolItems'))){
      this.kol = JSON.parse(window.localStorage.getItem('kolItems'));
    }
    else{
      this.kol = 0;
    }

  }


  countSumOrder(){

    this.sumOrder = 0;

    for(let i in this.cart){
      if(this.cart[i]!=null){

        this.sum = 0;
        this.price = this.cart[i].price;

        this.sum = this.price*this.cart[i].count;
        this.sumOrder += this.sum;
      }

    }

    window.localStorage.setItem('sumOrder', JSON.stringify(this.sumOrder));

  }

  countKolOrder(){

    this.kol = 0;

    this.cart.forEach(i => {

      if(i != null){
        this.kol += i.count;
      }

    });

    if(this.kol == 0){
      window.localStorage.removeItem('kolItems');
      window.localStorage.removeItem('sumOrder');
      window.localStorage.removeItem('cart');

    }
    else{
      window.localStorage.setItem('kolItems', JSON.stringify(this.kol));
    }

  }

  addToCartPlus(el){


    if(el.count > 0){
      el.count++;
      this.qyu = el.count;

      let OI_No = this.cart.indexOf(el);

      let data = {
        "OrdTtl_Id" : this.ord_Id,
        "OI_No": OI_No,
        "Qty": this.qyu
      }

      this.mainService.changeQty(data)
      .subscribe(
        (res: any) => {
          if(res.result == true){
            window.localStorage.setItem('cart', JSON.stringify(this.cart));
          }
      });
      this.countSumOrder();
      this.countKolOrder();
      window.localStorage.setItem('cart', JSON.stringify(this.cart));
      this.orderService.doClick();
    }

  }

  addToCartMinus(el,index){

    if(el.count > 1){
      el.count--;
      this.qyu = el.count;

      let OI_No = this.cart.indexOf(el) ;

      let data = {
        "OrdTtl_Id" : this.ord_Id,
        "OI_No" : OI_No,
        "Qty": this.qyu
      }

      this.mainService.changeQty(data)
      .subscribe(
        (res: any) => {
          if(res.result == true){
            window.localStorage.setItem('cart', JSON.stringify(this.cart));
          }
      });
      this.countSumOrder();
      this.countKolOrder();
      window.localStorage.setItem('cart', JSON.stringify(this.cart));
      this.orderService.doClick();
    }
    else{
      el.count = 0;
      this.countSumOrder();
      this.countKolOrder();
      this.cart.splice(this.cart.indexOf(el), 1);
      window.localStorage.setItem('cart', JSON.stringify(this.cart));
      this.orderService.doClick();
    }


  }

  addToOrder(){

        if(this.authService.isAuthenticated() == true){

          this.showOrder = true;
          this.showProductOrder = false;
        }
        else{
          this.showMessage('Авторизуйтесь для заказа', 'danger');
        }


  }

  addToOrderSave(){
    this.showSpinner = true;
    if(this.authService.isAuthenticated()){

      this.showOrder = true;
      this.showProductOrder = false;

      let authorization = 'Bearer ' + this.authService.getToken();

      const headers = new Headers({
        'Content-Type': 'application/json; charset=utf8',
        'Authorization': authorization
      });

      const formData = this.form.value;

      this.data_form = {
        "Ord_ID" : this.orderService.getOrderId(),
        "Cust_ID": this.authService.getUserId(),
        "Addr": formData.Addr,
        "Note": formData.Note
      };
      this.mainService.saveOrder(this.data_form, headers)
      .subscribe(
        (res: any) => {
          this.showSpinner = false;
          if (res.result) {
            this.showMessage('Ваш заказ отправлен', 'success');

            window.localStorage.removeItem('sumOrder');
            window.localStorage.removeItem('kolItems');
            window.localStorage.removeItem('ord_Id');
            window.localStorage.removeItem('cart');
            this.orderService.doClick();
          } else {
            this.showMessage( 'Заказ не отправлен', 'danger');
          }
        },
        (error) => {
          this.showSpinner = false;
          this.showMessage( error, 'danger');
        }
      )
    }
    else{
      this.showMessage('Авторизуйтесь для заказа', 'danger');
    }
  }
}
