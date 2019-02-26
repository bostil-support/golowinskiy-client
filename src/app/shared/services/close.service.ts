import { Injectable } from "@angular/core"
import { Router } from "@angular/router"

@Injectable({
    providedIn: 'root'
})
export class CloseService{

    constructor(private router: Router){
    }

    clickCloseModal(){
        this.router.navigate([`/`])
    }

}