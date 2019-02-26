import { Component, OnInit } from '@angular/core'
import { AuthService } from './shared/services/auth.service'
import {MainService} from './shared/services/main.service';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent implements OnInit{

  constructor(private authService: AuthService, private mainService: MainService){

  }

  ngOnInit(){
    const token = localStorage.getItem('token')
    if(token !== null){
      this.authService.setToken(token)
    }

    this.mainService.saveCategoriesToStorage(null);
  }
}
