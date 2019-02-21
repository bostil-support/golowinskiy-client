import { Component, OnInit } from '@angular/core';
import {HttpService} from '../../services/http.service';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {LoginHandlerInterceptor} from '../../login-handler.interceptor';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoginHandlerInterceptor,
      multi: true,
    }
  ]
})
export class AuthComponent implements OnInit {
  login: string;
  password: string;
  constructor(private httpService: HttpService) { }

  ngOnInit() {
  }

  authClick() {
    this.httpService.auth(this.login, this.password);
  }
}
