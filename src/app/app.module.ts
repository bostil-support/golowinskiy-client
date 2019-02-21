import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './components/app.component';
import {AuthComponent} from './components/auth/auth.component';
import {RouterModule} from '@angular/router';
import {SecretsComponent} from './components/secrets/secrets.component';
import {MainComponent} from './components/main/main.component';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {SignupComponent} from './components/signup/signup.component';
import {appRoutes} from './routes';
import {ProductComponent} from './components/product/product.component';
import {JwtModule} from '@auth0/angular-jwt';
import { ImagesComponent } from './components/images/images.component';

export function tokenGetter(): string {
  return localStorage.getItem('token');
}

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    SecretsComponent,
    MainComponent,
    SignupComponent,
    ProductComponent,
    ImagesComponent
  ],
  imports: [
    RouterModule.forRoot(appRoutes),
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    JwtModule.forRoot({
      config: {
        tokenGetter,
        whitelistedDomains: [
          'golowinskiy-api.bostil.ru',
        ]
      }
    })
  ],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
