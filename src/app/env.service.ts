import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvService {

  // The values that are defined here are the default values that can
  // be overridden by env.js

  // API url
  public apiUrl = '';
  public shopName = '';
  public enableDebug = true;
  public enableToUnicode = true;
  constructor() {
  }

}
