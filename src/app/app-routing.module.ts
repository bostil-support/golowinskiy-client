import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"

import { AuthGuard } from "./shared/classes/auth.guard"
import { AppComponent } from "./app.component"

import { MainPageComponent } from "./main-page/main-page.component"
import { AdvertisementPageComponent } from "./advertisement-page/advertisement-page.component"
import { EditAdvertisementPageComponent } from "./edit-advertisement-page/edit-advertisement-page.component"

import { AuthPageComponent } from "./main-page/auth-page/auth-page.component"
import { LoginComponent } from "./main-page/auth-page/login/login.component"
import { RegistrationComponent } from "./main-page/auth-page/registration/registration.component"
import { RecoveryComponent } from "./main-page/auth-page/recovery/recovery.component"

import { ProductsPageComponent } from "./main-page/products-page/products-page.component"
import { DetailPageComponent } from "./main-page/detail-page/detail-page.component"
import { OrderComponent } from "./main-page/order/order.component"

const routes: Routes = [
    {path: '', component: MainPageComponent, children: [
        { path: 'auth', component: AuthPageComponent, children: [
            { path: 'login', component: LoginComponent },
            { path: 'registration', component: RegistrationComponent },
            { path: 'recovery', component: RecoveryComponent },
            {path: 'order', component: OrderComponent}
        ]}
    ]},
    { path: 'categories/:id/products', component: ProductsPageComponent, children: [
        { path: 'auth', component: AuthPageComponent, children: [
            { path: 'login', component: LoginComponent },
            { path: 'registration', component: RegistrationComponent },
            { path: 'recovery', component: RecoveryComponent },
            {path: 'order', component: OrderComponent}
        ]},
        { path: ':idProduct', component: DetailPageComponent }
    ]},
    { path: 'cabinet', component: MainPageComponent, canActivate: [AuthGuard] }, 
    { path: 'cabinet/categories/:id/products', component: ProductsPageComponent, canActivate: [AuthGuard], children: [
        { path: ':idProduct', component: DetailPageComponent }
    ]}, 
    { path: 'addProduct', component: AdvertisementPageComponent, canActivate: [AuthGuard] },
    { path: 'cabinet/categories/:id/products/:idProduct/edit', component: EditAdvertisementPageComponent }
]

@NgModule({
    imports: [
        RouterModule.forRoot(routes)
    ],
    exports: [
        RouterModule
    ] 
})
export class AppRoutingModule{

}