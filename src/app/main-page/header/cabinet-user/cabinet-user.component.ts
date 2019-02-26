import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-cabinet-user',
  templateUrl: './cabinet-user.component.html',
  styleUrls: ['./cabinet-user.component.scss']
})
export class CabinetUserComponent implements OnInit {

  showUser = false
  constructor(
    private authService: AuthService
  ) { 
  }

  ngOnInit() {
    this.authService.getUser()
    if(window.location.pathname.includes('cabinet')){
      this.showUser = true
    }
    else{
      this.showUser = false
    }
  } 

  onLogout(){
    this.authService.logout()
  }

}
