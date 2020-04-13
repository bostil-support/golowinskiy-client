import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable } from "rxjs"
import { tap } from 'rxjs/operators'

import { environment } from "../../../environments/environment"
import { User } from "../interfaces"
import { Router } from "@angular/router";
import {OrderService} from './order.service';
import { MainService } from "./main.service"

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private token = null
    private userId = null
    private appCode: string = null;
    private Account = {}

    constructor(private http: HttpClient,
        private router: Router,
        private mainService: MainService,
        private orderService: OrderService
        ){
        }

    public user = {
        'Cust_ID_Main': null
    }

    registration(shopId: string){
        this.user.Cust_ID_Main = shopId;
        return this.http.put(`${environment.api}Authorization`, this.user)
    }

    login(shopId: string): Observable<{
        accessToken: string,
        userId: string,
        role: string,
        fio: string,
        userName: string,
        phone: string
    }>{
        this.user.Cust_ID_Main = shopId;
        return this.http.post<{
            accessToken: string,
            userId: string,
            role: string,
            fio: string,
            userName: string,
            phone: string

        }>(`${environment.api}Authorization`, this.user)
            .pipe(
                tap(
                    ({accessToken, userId, role, fio, userName, phone}) => {
                        localStorage.setItem('token', accessToken)
                        localStorage.setItem('userId', userId)
                        localStorage.setItem('role', role)
                        localStorage.setItem('fio', fio)
                        localStorage.setItem('userName', userName)
                        localStorage.setItem('phone', phone)
                        this.setToken(accessToken)
                    }
                )
            )
    }

    getUser(){
        return this.Account = {
            'fio': localStorage.getItem('fio'),
            'userName': localStorage.getItem('userName')
        }
    }

    recovery(body){
        return this.http.post(`${environment.api}password`, body)
    }
    getUserId(): string{
        return localStorage.getItem('userId')
    }

    setToken(token: string){
        this.token = token
    }

    getToken(): string{
        return this.token
    }

    isAuthenticated(): boolean{
        return !!this.token
    }

    logout(){
        this.setToken(null)
        localStorage.clear()
        this.orderService.clearCartAndOrder()
        this.router.navigate(['/'])
    }
}
