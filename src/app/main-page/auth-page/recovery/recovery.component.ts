import { Component, OnInit } from '@angular/core'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { Subscription } from 'rxjs'
import { Router, ActivatedRoute, Params } from '@angular/router'

import { Message } from 'src/app/shared/models/message.model'
import { AuthService } from '../../../shared/services/auth.service'
import { environment } from 'src/environments/environment'


@Component({
  selector: 'app-recovery',
  templateUrl: './recovery.component.html',
  styleUrls: ['./recovery.component.scss']
})
export class RecoveryComponent implements OnInit {

  form: FormGroup
  message: Message
  params
  showSpinner = false

  constructor(private authService: AuthService,
              private router: Router,
              private route : ActivatedRoute) { }

  ngOnInit() {

    this.form = new FormGroup({
      'email': new FormControl(null, [Validators.required,Validators.email])   
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

  onSubmit(){

    this.showSpinner = true

    this.form.disable()
    const recoveryData = {
      'Cust_ID_Main': environment.idPortal,
      'Email': this.form.value.email
    }
    this.authService.recovery(recoveryData).subscribe(
      (res: any) => {
        this.showSpinner = false   
        if(res.founded == false){
          this.showMessage('danger', `${res.message}`)
        }
        else if(res.founded == true){          
          this.showMessage('success', `${res.message}`)          
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
