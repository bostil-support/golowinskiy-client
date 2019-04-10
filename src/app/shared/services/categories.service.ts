import {Injectable} from '@angular/core';
import {CategoryItem} from '../../categories/categories.component';
import {MainService} from './main.service';
import {BehaviorSubject} from 'rxjs';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private _mainCategories$: BehaviorSubject<CategoryItem[]> = new BehaviorSubject([])
  private _userCategories$: BehaviorSubject<CategoryItem[]> = new BehaviorSubject([])
  private _createCategories$: BehaviorSubject<CategoryItem[]> = new BehaviorSubject([])
  public mainCategories$ = this._mainCategories$.asObservable()
  public userCategories$ = this._userCategories$.asObservable()
  public createCategories$ = this._createCategories$.asObservable()

  constructor(
    private mainService: MainService,
    private authService: AuthService,
  ) { }

  fetchCategoriesAll() {
    this.mainService.getCategories().subscribe(res => {
      this._mainCategories$.next(res);
    })
  }

  fetchCategoriesUser() {
    this.mainService.getCategories(this.authService.getUserId()).subscribe(res => {
      this._userCategories$.next(res);
    })
  }

  fetchCategoriesCreate() {
    this.mainService.getCategories(this.authService.getUserId()).subscribe(res => {
      this._createCategories$.next(res);
    })
  }
}
