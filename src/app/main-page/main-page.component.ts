import { Component, OnDestroy, OnInit } from '@angular/core'
import { trigger, state, style, transition, animate } from '@angular/animations'
import { Subscription } from 'rxjs';

import { environment } from "../../environments/environment";
import { MainService } from '../shared/services/main.service';
import { ClockService } from '../shared/services/clock.service';

@Component({
  selector: 'main-page.component',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
  animations: [
    trigger('hideClock', [
      state('start', style({
        opacity: '1'
      })),
      state('end', style({
        opacity: '0'
      })),
      transition('start => end', animate('1000ms 0.5s ease-out'))
    ])
  ]
})
export class MainPageComponent implements OnInit, OnDestroy {

  clickClock = 'start'
  sub: Subscription
  
  constructor(
    private mainService: MainService,
    private clockService: ClockService
  ) { }  

  ngOnInit() {

    this.sub = this.mainService.getShopInfo()
      .subscribe(
        (res) => {
          this.mainService.getFonPictures()       
        },
        (error) => {
          this.mainService.getErrorFonPicture()
        }  
      )    
    
    if(document.getElementById("doc_time")){

      this.clockService.getClock()
      document.getElementById("inner").style.minHeight = `calc(100vh - ${document.getElementById("doc_time").offsetHeight}px - ${document.getElementById("footer").offsetHeight}px - 15px)`;   
          
      window.setTimeout(() => {
        this.clickClock = 'end'         
      }, 3000)
    }  
  }

  ngOnDestroy(){
    if(this.sub){
      this.sub.unsubscribe()
    }
  }

}


