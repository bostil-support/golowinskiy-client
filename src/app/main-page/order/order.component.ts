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
  data_form: { "Ord_ID": string | number; "Cust_ID": any; "Addr": any; "Note": any; };
  showProductOrder: boolean = true;

  user: any;

  showOrder: boolean = false;

  message: Message;
  form: FormGroup;

  showAddOrder: string = 'fa fa-shopping-basket';
  showSpinner: boolean = false;
  idCategorii;

  constructor(
        public el: ElementRef,
        private router: Router,
        private authService: AuthService,
        private route: ActivatedRoute,
        public orderService: OrderService,
        private mainService: MainService
  ) {
  }

  ngOnInit() {
    this.message = new Message('danger', '');

    this.form = new FormGroup({
      'Addr': new FormControl(null, [Validators.required]),
      'Note': new FormControl(null, [Validators.required])
    });

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

  addToOrder(){
    if(this.authService.isAuthenticated() == true){

      this.showOrder = true;
      this.showProductOrder = false;
    }
    else{
      this.showMessage('Авторизуйтесь для заказа', 'danger');
    }
  }

  changeCount(index: number, value: number) {
    console.log(this.orderService.getCart())
    // this.mainService.changeQty()
    let cart = this.orderService.getCart()
    this.mainService.changeQty({
      ordTtl_Id: this.orderService.getOrderId(),
      ctlg_No: cart[index].ctlg_No,
      qty: cart[index].count,
      ctlg_Name: cart[index].ctlg_Name,
      oI_No: cart[index].id,
    }).subscribe()
    if (value < 0) {
      this.orderService.removeOneItem(index)
    } else {
      this.orderService.addOneItem(index)
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

            this.orderService.clearCartAndOrder()
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
