import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {SignupResult, SuccessLoginResult} from '../results';
import {tokenGetter} from '../app.module';
import {from, Observable} from 'rxjs';
import {mergeMap} from 'rxjs/operators';
import {ImageDataInterface} from '../components/product/product.component';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  public static apiUrl = 'https://golowinskiy-api.bostil.ru/api/';

  constructor(private httpClient: HttpClient, private router: Router) { }

  auth(userName: string, password: string) {
    this.httpClient.post<SuccessLoginResult>(HttpService.apiUrl + 'Authorization', {
      userName,
      password,
      cust_ID_Main: 19139
    }).subscribe((data: SuccessLoginResult) => {
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('CID', data.userId);
    });
  }

  signup(userName: string, password: string, email: string) {
    this.httpClient.put(HttpService.apiUrl + 'Authorization', {
      password,
      f: userName,
      e_mail: email,
      cust_ID_Main: '19139',
    }).subscribe((data: SignupResult) => {
      if (data.result) {
        this.auth(userName, password);
      }
    });
  }

  imageUpload(image: ImageDataInterface) {
    const formData = new FormData();
    formData.append('AppCode', '19139');
    formData.append('TImageprev', image.name);
    formData.append('img', image.blob);
    return this.httpClient.post(HttpService.apiUrl + 'img/upload', formData);
  }

  productCreate(imageName: string, productName: string) {
    this.httpClient.post(HttpService.apiUrl + 'product', {
      Appcode: '19139',
      CID: localStorage.getItem('CID'),
      Catalog: '19139',
      Ctlg_Name: 'ПолуБотинки',
      Id: '500001',
      TImageprev: imageName,
      TName: productName,
    }).subscribe(() => console.log('product added'));
  }

  additionalImagesGroup(images: Blob[], productId: string) {
    return from(images).pipe(
      mergeMap(blob =>  this.additionalImages(blob, productId)),
    );
  }

  additionalImages(image: Blob, productId: string) {
    return this.httpClient.post(HttpService.apiUrl + 'AdditionalImg', {
      catalog: '19139',
      id: '500001',
      prc_ID: productId,
      imageOrder: 'string',
      tImage: 'string',
      appcode: '19139',
      cid: localStorage.getItem('CID'),
    });
  }

  gallery(): Observable<any> {
    console.log('hello');
    return this.httpClient.post(HttpService.apiUrl + 'gallery', {
      cust_ID: '19139',
      // suplier: "string",
      id: '500001',
      // "option": 0,
      // "ctlg_Name": "string",
      // ctlg_No: '500001',
      cid: localStorage.getItem('CID'),
    });
  }

  isAuthenticated(): boolean {
    return tokenGetter() != null;
  }
}
