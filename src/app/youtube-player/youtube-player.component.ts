import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-youtube-player',
  templateUrl: './youtube-player.component.html',
  styleUrls: ['./youtube-player.component.scss']
})
export class YoutubePlayerComponent implements OnInit {

  constructor(public sanitizer: DomSanitizer) { }
  youtubeLink: string = null;
  @Input() link : string = null;
  ngOnInit() {
    this.youtubeLink = 'https://www.youtube.com/embed/' + this.link.split('v=')[1];
  }

}