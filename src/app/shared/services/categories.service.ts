import {Injectable} from '@angular/core';
import {CategoryItem} from '../../categories/categories.component';
import {MainService} from './main.service';
import {BehaviorSubject, Observable} from 'rxjs';
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
  private _isCategoriesLoaded = new BehaviorSubject<boolean>(true);
  constructor(
    private mainService: MainService,
    private authService: AuthService,
  ) { }

  fetchCategoriesAll(userId?:string, advertId?:string) {
    this._isCategoriesLoaded.next(true)
    this.mainService.getCategories(userId,advertId).subscribe(res => {
      this._mainCategories$.next(res);
      this._isCategoriesLoaded.next(false)
    });
  }

  fetchCategoriesUser() {
    this._isCategoriesLoaded.next(true)
    this.mainService.getCategories(this.authService.getUserId()).subscribe(res => {
      this._userCategories$.next(res);
      this._isCategoriesLoaded.next(false)
    });
  }

  fetchCategoriesCreate() {
    this._isCategoriesLoaded.next(true)
    this.mainService.getCategories(this.authService.getUserId()).subscribe(res => {
      this._createCategories$.next(res);
      this._isCategoriesLoaded.next(false)
    });
  }

  public isCategoriesLoaded(): Observable<boolean> {
    return this._isCategoriesLoaded.asObservable();
  }
}
