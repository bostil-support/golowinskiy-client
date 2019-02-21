import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../services/http.service';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {SignupHandlerInterceptor} from '../../signup-handler.interceptor';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SignupHandlerInterceptor,
      multi: true,
    }
  ]
})
export class SignupComponent implements OnInit {
  userName: string;
  password: string;
  email: string;

  constructor(private httpService: HttpService) { }

  ngOnInit() {
  }

  signupClick() {
    this.httpService.signup(this.userName, this.password, this.email);
  }
}
