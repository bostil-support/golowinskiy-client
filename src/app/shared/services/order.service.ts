import {EventEmitter, Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class OrderService {
    private orderId: number;
    private cart = [];

    onClick:EventEmitter<number> = new EventEmitter()
    onClickSum:EventEmitter<number> = new EventEmitter()


    constructor(
    ) {
      this.orderId = JSON.parse(window.localStorage.getItem('ord_ID'))
      this.cart = JSON.parse(window.localStorage.getItem('cart')) || []
    }


    addToOrder(el, ctlg_No: string, ctlg_Name: string, sup_ID: string) {
        let price = parseInt(el.prc_Br.split('.')[0].replace(/\D+/g,""));

        this.cart.push({
          art: this.cart.length,
          id: el.prc_ID,
          name: el.tName,
          count: 1,
          price: price,
          strike: true,
          ctlg_No,
          ctlg_Name,
          sup_ID,
        });
        window.localStorage.setItem('cart', JSON.stringify(this.cart))
    }

    addOneItem(index: number) {
      this.cart[index].count += 1
      window.localStorage.setItem('cart', JSON.stringify(this.cart))
    }

    removeOneItem(index: number) {
      let count = this.cart[index].count -= 1
      if (count <= 0) {
        this.cart.splice(index, 1)
      }
      window.localStorage.setItem('cart', JSON.stringify(this.cart))
    }

    clearCartAndOrder() {
      this.cart = [];
      window.localStorage.setItem('cart', JSON.stringify(this.cart))
      window.localStorage.removeItem('ord_ID')
    }

    countSum(){
        return this.cart.reduce((prev, cur) => prev + cur.price, 0);
    }

    countKol(){
      return this.cart.length;
    }

    public getCart() {
      return this.cart;
    }

    public setOrderId(orderId: number) {
      this.orderId = orderId;
      window.localStorage.setItem('ord_ID', this.orderId.toString());
    }

    public getOrderId(): number {
      return this.orderId;
    }

    public doClick() {
      this.onClick.emit(this.countKol())
      this.onClickSum.emit(this.countSum())
    }

    public containsProduct(id: number) {
      return this.cart.find((item) => item.id === id) !== undefined
    }
}
