import { Injectable } from "@angular/core"

@Injectable({
    providedIn: 'root'
})
export class ClockService{

    d: Date;
    month_num;
    dayOfWeek;
    day;
    minutes;
    hours;  
    seconds;

    constructor(){
    }

    getClock(){   

        this.d = new Date();
        this.month_num = this.d.getMonth();
        this.dayOfWeek = this.d.getDay();
        this.day = this.d.getDate();
        this.hours = this.d.getHours();
        this.minutes = this.d.getMinutes();
        this.seconds = this.d.getSeconds();
    
        var month = new Array("января", "февраля", "марта", "апреля", "мая", "июня",
        "июля", "августа", "сентября", "октября", "ноября", "декабря");
  
        var dayOfWeek = new Array("понедельник", "вторник", "среда", "четверг", "пятница", "суббота",
        "воскресенье");
  
        if (this.hours <= 9) this.hours = "0" + this.hours;
        if (this.minutes <= 9) this.minutes = "0" + this.minutes;
        if (this.seconds <= 9) this.seconds = "0" + this.seconds;
  
        var date_time = '<p class="data-time">' 
                          + this.hours 
                          + ":" 
                          + this.minutes 
                        +'</p>'
                        +'<p>' 
                          + dayOfWeek[this.dayOfWeek - 1] 
                          + ", " 
                          + this.day 
                          + " " 
                          + month[this.month_num] 
                        +'</p>';
        
  
        if(document.getElementById("doc_time")){
          document.getElementById("doc_time").innerHTML = date_time;
        }
  
    }

}