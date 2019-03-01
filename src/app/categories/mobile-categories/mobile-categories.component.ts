import {Component, Input, OnInit} from '@angular/core';
import {CategoryItem} from '../categories.component';

@Component({
  selector: 'app-mobile-categories',
  templateUrl: './mobile-categories.component.html',
  styleUrls: ['./mobile-categories.component.scss']
})
export class MobileCategoriesComponent implements OnInit {
  @Input() category: CategoryItem

  constructor() { }

  ngOnInit() {
  }

}
