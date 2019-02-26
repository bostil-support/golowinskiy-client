import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, RouterStateSnapshot, Router } from "@angular/router"
import { Observable, of } from "rxjs"
import { Injectable } from "@angular/core"

import { AuthService } from "../services/auth.service"


@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild{
    constructor(private auth: AuthService,
                private router: Router){

    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>{
        if(this.auth.isAuthenticated()){
            return of(true)
        }
        else{            
            if(route.routeConfig.path){
                this.router.navigate(['/auth/login'], {
                    queryParams: {
                        route: route.routeConfig.path
                    }
                })            
            }
            else{
                this.router.navigate(['/auth/login']) 
            }            
            return of(false)
        }
    }
    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>{
        return this.canActivate(route, state)
    }
}