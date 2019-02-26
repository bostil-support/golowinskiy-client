import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router';

import { MainService } from '../../shared/services/main.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  showBasket = false
  hideCabinet = false
  showMenu = false
  hideOnMainPage = false

  constructor(private router: Router,
    private route: ActivatedRoute,
    private mainService: MainService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if(window.location.pathname.includes('cabinet')){
      this.showBasket = false
      this.hideCabinet = false
      this.hideOnMainPage = true
    }
    else{
      this.showBasket = true
      this.hideCabinet = true
      this.hideOnMainPage = false
    }
  }

  toOrder(){
    this.router.navigate([`${window.location.pathname}/order`])
  }
  openMenu(){
    this.showMenu = true
  }
  onLogout(){
    this.hideMenu()
    this.authService.logout()
  }
  back(){
    this.hideMenu()
    this.router.navigate(['/'])
  }
  closeMenu(){
    this.hideMenu()
  }

  hideMenu(){
    this.showMenu = false
  }

}
