import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../services/http.service';

@Component({
  selector: 'app-images',
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.css']
})
export class ImagesComponent implements OnInit {
  imagesData;

  constructor(public httpService: HttpService) { }

  ngOnInit() {
    this.httpService.gallery().subscribe((data) => this.imagesData = data);
  }
}
