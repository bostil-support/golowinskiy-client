import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {forkJoin, from, Observable, of} from 'rxjs';
import {mergeMap, switchMap, tap} from 'rxjs/operators';
import {CategoryItem} from '../../categories/categories.component';
import {AdditionalImagesData, AdditionalImagesRequest, DeleteProduct} from '../interfaces';
import {OrderService} from './order.service';
import {ShopInfoModel} from '../models/shop-info.model';
import { CommonService } from './common.service';
import { EnvService } from 'src/app/env.service';
const punycode = require('punycode');

@Injectable({
  providedIn: 'root'
})
export class MainService {
  idPortal: string = null;
  private cust_id = null;
  private mainImage = null;
  private mainPictureAccountUser = null;
  public productsByCategoryId = new Array();
  constructor(
    private http: HttpClient,
    private orderService: OrderService,
    public commonService: CommonService,
    private env: EnvService,
  ) {
    if(this.env.enableDebug)
    console.log("хост: "+this.env.enableToUnicode ? punycode.toUnicode(location.hostname.split('.')[0]) : location.hostname.split('.')[0]);
  }

  public getUserId() {
    return this.http.get(`${this.env.apiUrl}/api/Load/${this.cust_id}`);
  }
  zeroDomains = ['localhost','головинский','www'];
  public getPortal() {
    const shopName = this.env.shopName;
    if(shopName && shopName.trim().length !== 0){
      return shopName
    }else{
      const host = this.env.enableToUnicode ? punycode.toUnicode(location.hostname.split('.')[0]) : location.hostname.split('.')[0];
      if(host)
        return this.zeroDomains.includes(host) ? 'golowinskiy' : host;
      else
        alert('не могу определить ID магазина');
    }
  };

  setIdPortal = (id: any) => this.idPortal = id;
  getIdPortal = () => this.idPortal;

  getShopInfo() {
    return this.http.get<ShopInfoModel>(`${this.env.apiUrl}/api/shopinfo/${this.getPortal()}`)
      .pipe(
        tap(
          ({cust_id, mainImage, mainPictureAccountUser}) => {
            this.setCustId(cust_id);
            this.setFonPictures(mainImage, mainPictureAccountUser);
          }
        )
      );
  }

  setCustId(cust_id: string) {
    this.cust_id = cust_id;
  }

  getCustId(): string {
    return this.cust_id;
  }

  setFonPictures(mainImage, mainPictureAccountUser) {
    this.mainImage = mainImage;
    this.mainPictureAccountUser = mainPictureAccountUser;
  }

  getFonPictures() {
    let fonPicture;
    if (document.getElementById('fon-image')) {
      if (window.location.pathname.includes('cabinet')) {
        fonPicture = document.getElementById('fon-image').style.background = `url('${this.env.apiUrl}${this.mainPictureAccountUser}') no-repeat 50% 50%`;
      } else {
        fonPicture = document.getElementById('fon-image').style.background = `url('${this.env.apiUrl}${this.mainImage}') no-repeat 50% 50%`;
      }
    }
    return fonPicture;
  }

  getErrorFonPicture() {
    if (document.getElementById('fon-image')) {
      document.getElementById('fon-image').style.background = 'url(\'/assets/images/fon2.jpg\') no-repeat 50% 50%';
    }
  }

  getUserInfo(headers?) {
    return this.http.get(`${this.env.apiUrl}/api/userinfo/${localStorage.getItem('userId')}/`);
  }

  getCategories(idPortal:any,userId?: string, advert?: string) {
    let prepatedObject = {
      cust_ID_Main: idPortal,
      cid: userId,
      advert: advert
    };
      if(!prepatedObject.advert)
      delete prepatedObject.advert   
    return this.http.post<CategoryItem[]>(
      `${this.env.apiUrl}/api/categories`, prepatedObject);
  }

  getProducts(id, cust_id, userId): Observable<any> {
    return this.http.post(`${this.env.apiUrl}/api/Gallery/`,
      {
        Cust_ID: cust_id,
        ID: id,
        CID: userId
      }
    );
  }

  getProduct(prc_ID: any, cust_id, appCode) {
    return this.http.post(`${this.env.apiUrl}/api/Img`,
      {
        'prc_ID': prc_ID,
        'cust_ID': cust_id,
        'appCode': appCode
      }
    );
  }
/*
  uploadImage(data: any) {
    return this.http.post(`${this.env.apiUrl}/api/img/upload/`, data);
  }
*/


  uploadImage(data: any){
  //  return this.postImagesXHR(`${this.env.apiUrl}/api/img/upload/`,data)
    return this.http.post(`${this.env.apiUrl}/api/img/upload/`, data);
  }
  uploadImageXHR(data: any,i?,callback?){
      return this.postImagesXHR(`${this.env.apiUrl}/api/img/upload/`,data,i,callback)
    }

  sizeCounter: number = 0;
  postImagesXHR(url,data,i?,callback?) {
    let previousSendedData: number = null
    return from(new Promise((res,rej)=>{
      const bro = {
        getData: (data: number) => {
            const res = previousSendedData == null ? data : data - previousSendedData;
            this.sizeCounter +=res
            this.commonService.addImagesStackUploaded.next(this.sizeCounter);
            previousSendedData = data;
        }
      }
      const xhr = new XMLHttpRequest(); 
      xhr.open('POST', url);
      xhr.upload.onprogress = (event) => callback(i, event.loaded,event.total)// bro.getData(event.loaded)  
      xhr.upload.onload = () => res(xhr);
      xhr.upload.onerror = () => rej(xhr)
      xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
      xhr.send(data);
    }));
  }

  uploadImageGroup(data: FormData[]) {
    return from(data).pipe(
      mergeMap(item => this.uploadImage(item))
    );
  }

  addProduct(data: any, headers) {
    return this.http.post(`${this.env.apiUrl}/api/product`, data, headers);
  }

  deleteProduct(data: DeleteProduct) {
    let options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: data
    };
    return this.http.delete(`${this.env.apiUrl}/api/product`, options);
  }

  editProduct(data: any) {
    return this.http.put(`${this.env.apiUrl}/api/product`, data);
  }

  editAdditionalImg(data: any) {
    return this.http.put(`${this.env.apiUrl}/api/AdditionalImg/api/AdditionalImg`, data);
  }
  deleteAdditionalImg(data: any) {
    let options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: data
    };
    return this.http.delete(`${this.env.apiUrl}/api/AdditionalImg/api/AdditionalImg`, options);
  }

  additionalImagesGroup(data: AdditionalImagesData[]) {
    return from(data).pipe(
      mergeMap(item =>
        forkJoin(this.uploadImage(item.imageData)
        )
      )
    );
  }
  uploadImagesArray(data: any) {
    return from(data).pipe(
      mergeMap(item => this.uploadImage(item)
      )
    );
  }
  additionalImagesArray(data: any) {
    return from(data).pipe(
      mergeMap((item: any) => this.additionalImageUpload(item.request)
      )
    );
  }

  additionalImageUpload(additionalData: AdditionalImagesRequest) {
    return this.http.post(`${this.env.apiUrl}/api/AdditionalImg`, additionalData);
  }

  saveCategoriesToStorage(categories) {
    localStorage.setItem('categories', JSON.stringify(categories));
  }

  loadCategoriesFromStorage() {
    return JSON.parse(localStorage.getItem('categories')) || [];
  }

  changeQty(data: {}) {
    return this.http.post(`${this.env.apiUrl}/api/order/changeqty/ `, data);
  }

  saveOrder(data: {}, headers) {
    return this.http.post(`${this.env.apiUrl}/api/order/save/ `, data, headers);
  }

  registerOrder() {
    return this.getUserId().pipe(
      switchMap(res => this.http.post(`${this.env.apiUrl}/api/order/`, {Cust_ID: res, Cur_Code: 810})),
      switchMap((res: any) => {
        localStorage.setItem('ord_No', res.ord_No);
        this.orderService.setOrderId(res.ord_ID);
        return of(res);
      })
    );
  }

  addToCart(data) {
    return this.http.post(`${this.env.apiUrl}/api/addtocart `, data);
  }
}
