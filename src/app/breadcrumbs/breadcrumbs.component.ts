import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CatalogItem} from '../categories/categories.component';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnInit {
  @Input() categories: CatalogItem[];
  @Output() click = new EventEmitter()

  constructor() { }

  ngOnInit() {
  }

  breadcrumbsClick() {
    this.click.emit();
  }
}
