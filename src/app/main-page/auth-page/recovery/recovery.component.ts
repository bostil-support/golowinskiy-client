import { Component, OnInit } from '@angular/core'
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms'
import { Subscription } from 'rxjs'
import { Router, ActivatedRoute, Params } from '@angular/router'

import { Message } from 'src/app/shared/models/message.model'
import { AuthService } from '../../../shared/services/auth.service'
import { environment } from 'src/environments/environment'
import { MainService } from 'src/app/shared/services/main.service'

export class CustomValidator{
  // Number only validation
  static numeric(control: AbstractControl) {
    let val = control.value;

    if (val === null || val === '') return null;

    if (!val.toString().match(/^[0-9]+(\.?[0-9]+)?$/)) return { 'invalidNumber': true };

    return null;
  }
}

@Component({
  selector: 'app-recovery',
  templateUrl: './recovery.component.html',
  styleUrls: ['./recovery.component.scss']
})

export class RecoveryComponent implements OnInit {

  form: FormGroup
  message: Message
  params
  showSpinner = false;
  private appCode: string = null;
  phoneNumber = "^(\+\d{1,3}[- ]?)?\d{10}$";
  constructor(private authService: AuthService,
              private router: Router,
              private mainService: MainService,
              private route : ActivatedRoute) {
                this.mainService.getShopInfo().subscribe((res) => {
                  this.appCode = res.cust_id;
              }, error=>alert(error.error.message));
               }

  ngOnInit() {

    this.form = new FormGroup({
      'phone': new FormControl('', [Validators.required])   
    }); 

    this.message = new Message('danger', '')

    this.route.queryParams.subscribe((params: Params) => {
      this.params = params
    })

  }
  show: boolean = false;
  private showMessage(type: string = 'danger', text: string, redirect: boolean = false){
    this.show = true;
    this.message = new Message(type, text);
    setTimeout(() => {
      if(this.message.type == 'success'){
        this.message.text = null;
        this.show = false;
        if(redirect)
        this.router.navigate([`/auth/login`], {
          queryParams: {
              route: this.params.route
          }
        })
      }
    }, 5000);
  }

  onSubmit(){

    this.showSpinner = true

 //   this.form.disable()
    const recoveryData = {
      'Cust_ID_Main': this.appCode,
      'phone': this.form.value.phone
    }
    this.authService.recovery(recoveryData).subscribe(
      (res: any) => {
        this.showSpinner = false;   
        if(res.founded == false){
          this.showMessage('danger', `${res.message}`)
        }
        else if(res.founded == true){          
          this.showMessage('success', `${res.message}`, true)          
        }
      },
      (error) => {    
    //    this.form.reset();    
        this.showMessage('danger', error.message)
        this.showSpinner = false;
      }
    )
  }

}
