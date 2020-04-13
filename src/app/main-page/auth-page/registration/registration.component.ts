import { Component, OnInit } from '@angular/core'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { Subscription } from 'rxjs'
import { Router, ActivatedRoute, Params } from '@angular/router'

import { Message } from 'src/app/shared/models/message.model'
import { AuthService } from '../../../shared/services/auth.service'
import { MainService } from 'src/app/shared/services/main.service'


@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  form: FormGroup
  message: Message
  sub: Subscription
  params;
  shopId: string = null;  
  showSpinner = false
  

  constructor(private authService: AuthService,
    private router: Router,
    private mainService: MainService,
    private route: ActivatedRoute) {
      this.mainService.getShopInfo().subscribe((res) => {
        this.shopId = res.cust_id;
      }, error=>alert(error.error.message));
     }

  ngOnInit() {

    this.form = new FormGroup({
      'f': new FormControl(null),
      'email': new FormControl(null, [Validators.required, Validators.email]),     
      'Phone1': new FormControl(null),
      'Mobile': new FormControl(null),
      'password': new FormControl(null, [Validators.required])     
    }); 

    this.message = new Message('danger', '')

    this.route.queryParams.subscribe((params: Params) => {
      this.params = params
    })

  }

  private showMessage(type: string = 'danger', text: string){
    this.message = new Message(type, text)
    window.setTimeout(() => {
      if(this.message.type == 'success'){
        this.message.text = ''
        this.router.navigate([`/auth/login`], {
          queryParams: {
              route: this.params.route
          }
        })
      }
    }, 2000);
  }

  ngOnDestroy(){
    if(this.sub){
      this.sub.unsubscribe()
    }    
  }

  onSubmit(){

    this.showSpinner = true

    this.form.disable()

    this.sub = this.authService.registration(this.shopId).subscribe(
      (res: any) => {
        this.showSpinner = false   
        if(res.result == false){
          this.showMessage('danger', `${res.message}`);
        }
        else if(res.result == true){          
          this.showMessage('success', `${res.message}`);          
        }
        
      },
      (error) => {        
        this.showMessage('danger', 'Неверные данные')
        this.showSpinner = false
        this.form.enable()
      }
    )
  }

}
