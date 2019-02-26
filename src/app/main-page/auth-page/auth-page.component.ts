import { Component, OnInit } from '@angular/core'

import { CloseService } from '../../shared/services/close.service'

@Component({
  selector: 'app-auth-page',
  templateUrl: './auth-page.component.html',
  styleUrls: ['./auth-page.component.scss']
})
export class AuthPageComponent implements OnInit {

  constructor(private closeService: CloseService) { }

  ngOnInit() {
  }

}
