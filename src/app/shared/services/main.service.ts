import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {concat, from, Observable} from 'rxjs';
import {mergeMap, tap} from 'rxjs/operators';

import {environment} from 'src/environments/environment';
import {CatalogItem} from '../../categories/categories.component';
import {AdditionalImagesData, AdditionalImagesRequest, Product} from '../interfaces';


@Injectable({
    providedIn: 'root'
})
export class MainService{

    private baseUrl = environment.api;

    urlPortal = location.hostname.split('.')[0]

    idPortal: string = environment.idPortal
    private cust_id = null
    private mainImage = null
    private mainPictureAccountUser = null

    constructor(private http: HttpClient){
    }

    public getPortal(){
        return this.urlPortal;
    }

    public getIdPortal(){
        var n = parseInt(this.urlPortal)

        if(location.hostname.split('.').length == 2 || location.hostname == environment.domain){
            return this.idPortal

        }
        else{
            return this.urlPortal
        }

    }

    getShopInfo():Observable<{
        cust_id: string,
        mainImage: string,
        mainPictureAccountUser: string
    }>{
        return this.http.get<{
            cust_id: string,
            mainImage: string,
            mainPictureAccountUser: string
        }>(`${environment.api}shopinfo/${this.getIdPortal()}`)
            .pipe(
                tap(
                   ({cust_id, mainImage, mainPictureAccountUser}) => {
                        this.setCustId(cust_id)
                        this.setFonPictures(mainImage, mainPictureAccountUser)
                    }
                )
            )
    }

    setCustId(cust_id: string){
        this.cust_id = cust_id
    }

    getCustId(): string{
        return this.cust_id
    }

    setFonPictures(mainImage, mainPictureAccountUser){
        this.mainImage = mainImage
        this.mainPictureAccountUser = mainPictureAccountUser
    }

    getFonPictures(){
        let fonPicture
        if(document.getElementById('fon-image')){
            if(window.location.pathname.includes('cabinet')){
                fonPicture = document.getElementById('fon-image').style.background = `url('${environment.images}${this.mainPictureAccountUser}') no-repeat 50% 50%`
            }
            else{
                fonPicture = document.getElementById('fon-image').style.background = `url('${environment.images}${this.mainImage}') no-repeat 50% 50%`
            }
        }
        return fonPicture
    }
    getErrorFonPicture(){
        if(document.getElementById('fon-image')){
            document.getElementById('fon-image').style.background = "url('/assets/images/fon2.jpg') no-repeat 50% 50%";
        }
    }

    getUserInfo(headers){
        return this.http.get(`${environment.api}userinfo/${localStorage.getItem('userId')}/`, headers)
    }

    getCategories(userId, advert){
        return this.http.post<CatalogItem[]>(
            `${environment.api}categories`, {
                Cust_ID_Main: this.getCustId(),
                CID: userId,
                advert: advert
            })
    }

    getProducts(id, cust_id, userId):Observable<any>{
        return this.http.post(`${environment.api}Gallery/`,
            { Cust_ID: cust_id,
              ID: id,
              CID: userId
            }
        )
    }

    getProduct(prc_ID: any, cust_id, appCode){
        return this.http.post(`${environment.api}Img`,
            {
                "prc_ID": prc_ID,
                "cust_ID": cust_id,
                "appCode": appCode
            }
        )
    }

    uploadImage(data: any){
        return this.http.post(`${environment.api}img/upload/`, data)
    }

    uploadImageGroup(data: FormData[]) {
        return from(data).pipe(
          mergeMap(item => this.uploadImage(item))
        )
    }

    addProduct(data: any, headers){
        return this.http.post(`${environment.api}product`, data, headers)
    }

    deleteProduct(data: Product){
        let options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
              }),
            body: data
        }
        return this.http.delete(`${environment.api}Img`, options)
    }

    editProduct(data: any){
        return this.http.put(`${environment.api}product`, data)
    }

    editAdditionalImg(data: any){
        return this.http.put(`${environment.api}AdditionalImg/api/AdditionalImg`, data)
    }

    addAdditionalImg(data: any, headers){
        return this.http.post(`${environment.api}AdditionalImg`, data, headers)
    }

    additionalImagesGroup(data: AdditionalImagesData[]) {
      return from(data).pipe(
        mergeMap(item =>
          concat(this.uploadImage(item.imageData),
            this.additionalImageUpload(item.request)
          )
        )
      )
    }

    additionalImageUpload(additionalData: AdditionalImagesRequest) {
      return this.http.post(`${environment.api}AdditionalImg `, additionalData);
    }

    saveCategoriesToStorage(categories) {
      localStorage.setItem('categories', JSON.stringify(categories))
    }

    loadCategoriesFromStorage() {
      return JSON.parse(localStorage.getItem('categories')) || [];
    }
}
