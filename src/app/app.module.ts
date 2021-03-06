import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgxPaginationModule} from 'ngx-pagination';
import {TokenInterceptor} from './shared/classes/token.interceptor';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';

import {MainPageComponent} from './main-page/main-page.component';
import {AdvertisementPageComponent} from './advertisement-page/advertisement-page.component';
import {EditAdvertisementPageComponent} from './edit-advertisement-page/edit-advertisement-page.component';

import {HeaderComponent} from './main-page/header/header.component';
import {CabinetUserComponent} from './main-page/header/cabinet-user/cabinet-user.component';
import {DropdownDirective} from './shared/directives/dropdown.directive';
import {FooterComponent} from './main-page/footer/footer.component';

import {AuthPageComponent} from './main-page/auth-page/auth-page.component';
import {LoginComponent} from './main-page/auth-page/login/login.component';
import {RegistrationComponent} from './main-page/auth-page/registration/registration.component';
import {RecoveryComponent} from './main-page/auth-page/recovery/recovery.component';
import {CategoriesComponent} from './categories/categories.component';
import {ProductsPageComponent} from './main-page/products-page/products-page.component';
import {DetailPageComponent} from './main-page/detail-page/detail-page.component';
import {BreadcrumbsComponent} from './breadcrumbs/breadcrumbs.component';
import { OrderComponent } from './main-page/order/order.component';
import { MobileCategoriesComponent } from './categories/mobile-categories/mobile-categories.component';
import { EnvServiceProvider } from './env.service.provider';
import { YoutubePlayerComponent } from './youtube-player/youtube-player.component';

@NgModule({
  declarations: [
    AppComponent,
    MainPageComponent,
    AdvertisementPageComponent,
    EditAdvertisementPageComponent,
    HeaderComponent,
    CabinetUserComponent,
    DropdownDirective,
    FooterComponent,
    AuthPageComponent,
    LoginComponent,
    RegistrationComponent,
    RecoveryComponent,
    CategoriesComponent,
    ProductsPageComponent,
    DetailPageComponent,
    BreadcrumbsComponent,
    OrderComponent,
    MobileCategoriesComponent,
    YoutubePlayerComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    NgxPaginationModule,
  ],
  providers: [
    EnvServiceProvider,
    {
      provide: HTTP_INTERCEPTORS,
      multi: true,
      useClass: TokenInterceptor
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
