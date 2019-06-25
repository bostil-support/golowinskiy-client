// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

interface Environment {
  production: boolean;
  api: string;
  images: string;
  idPortal: string;
  domain: string;
}

export const environment: Environment = {
  production: false,
  api: 'http://golowinskiy-api.bostil.ru/api/',
  images: 'http://golowinskiy-api.bostil.ru',
  idPortal: '19139',
  domain: 'golowinskiy.bostil.ru'
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
