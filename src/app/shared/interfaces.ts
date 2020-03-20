export interface User{
    Cust_ID_Main: string
    Mobile?: string
    Phone1?: string
    e_mail: string
    f?: string
    password: string
}

export interface AdditionalImagesRequest {
  catalog: string,
  id: string,
  prc_ID: string,
  imageOrder: number,
  tImage: Blob | string,
  appcode: string,
  cid: string
}

export interface AdditionalImagesData {
  request: AdditionalImagesRequest,
  imageData?: FormData,
}

export interface Product{
    prc_ID: number,
    cust_ID: number,
    appCode: string
}

export interface DeleteProduct {
  prc_ID: number | string,
  cust_ID: number | string,
  appCode: string | string,
  cid: number | string,
}
