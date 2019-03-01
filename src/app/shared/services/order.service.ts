import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class OrderService {

    kolOrder = 0;
    sumOrder = 0;
    price: number;
    articul: any;
    quantity;
    cart = [];

    private clickCnt;
    private clickSum;

    onClick:EventEmitter<number> = new EventEmitter();
    onClickSum:EventEmitter<number> = new EventEmitter();


    constructor() {
      this.doClick()
      this.cart = JSON.parse(window.localStorage.getItem('cart')) || [];
      this.sumOrder = JSON.parse(window.localStorage.getItem('sumOrder')) || 0;
      this.kolOrder = JSON.parse(window.localStorage.getItem('kolItems')) || 0;

    }


    addToOrder(el) {
        this.price = parseInt(el.prc_Br.split('.')[0].replace(/\D+/g,""));

        this.articul = this.articul? 0: undefined
        this.quantity = 1;

        if(this.cart){
          for(let i = 0; i < this.cart.length; i++){
            this.articul = (i+1);
          }
        }

        if(this.articul!=undefined){
            this.cart.push({
              art: this.articul,
              id: el.prc_ID,
              name: el.tName,
              count: 1,
              price: this.price,
              strike: true
            });
          }
        else{
            this.cart.push({
              art: 0,
              id: el.prc_ID,
              name: el.tName,
              count: 1,
              price: this.price,
              strike: true
            });
        }
        if(JSON.parse(window.localStorage.getItem('sumOrder'))){
            this.sumOrder += this.price;
        }
        else{
            this.sumOrder = this.price;
        }
        if(JSON.parse(window.localStorage.getItem('cart'))){
          this.kolOrder++;
        }
        else{
          this.kolOrder = 1;
        }

        window.localStorage.setItem('cart', JSON.stringify(this.cart));
        window.localStorage.setItem('sumOrder', JSON.stringify(this.sumOrder));
        window.localStorage.setItem('kolItems', JSON.stringify(this.kolOrder));
    }

    countSum(){
        return this.sumOrder;
    }

    countKol(){
      return this.kolOrder;
    }

    public doClick(){

      if(window.localStorage.getItem('kolItems') || window.localStorage.getItem('sumOrder')){
        this.kolOrder = parseInt(window.localStorage.getItem('kolItems'))
        this.sumOrder = parseFloat(window.localStorage.getItem('sumOrder'))

        this.clickCnt = this.kolOrder;
        this.clickSum = this.sumOrder;
      }
      else{
        this.clickCnt = 0
        this.clickSum = 0
      }

      this.onClick.emit(this.clickCnt)
      this.onClickSum.emit(this.clickSum)
    }

    public containsProduct(id: number) {
      return this.cart.find((item) => item.id === id) !== undefined
    }
}
