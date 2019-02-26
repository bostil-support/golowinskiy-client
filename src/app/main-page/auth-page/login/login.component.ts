import { Component, OnDestroy, OnInit } from '@angular/core'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Message } from 'src/app/shared/models/message.model'
import { AuthService } from '../../../shared/services/auth.service'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  form: FormGroup
  message: Message
  sub: Subscription  
  params
  showSpinner = false

  constructor(private authService: AuthService,
              private router: Router,
              private route : ActivatedRoute) { }

  ngOnInit() {
    
    this.form = new FormGroup({
      'email': new FormControl(null, [Validators.required, Validators.email]),
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
        this.router.navigate([`/${this.params.route}`])
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

    this.sub = this.authService.login().subscribe(
      (res) => {
        this.showSpinner = false
        if(res.role == 'customer'){
          this.showMessage('success', 'Вы вошли в систему как пользователь')  
        }
        else if(res.role == 'admin'){
          this.showMessage('success', 'Вы вошли в систему как администратор')
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
