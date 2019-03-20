import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CategoryItem} from '../categories/categories.component';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnInit {
  _categories: CategoryItem[];
  @Input() set categories(categories: CategoryItem[]) {
    this._categories = [...categories]
    let last = this._categories.pop();
    if (last) {
      last.txt = last.txt.replace(/\(\d+\)/, '')
      this._categories.push(last)
    }
  }
  @Output() click = new EventEmitter()

  constructor() { }

  ngOnInit() {
  }

  breadcrumbsClick() {
    this.click.emit();
  }
}
