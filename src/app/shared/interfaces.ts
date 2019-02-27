export interface User{
    Cust_ID_Main: string
    Mobile?: string
    Phone1?: string
    e_mail: string
    f?: string
    password: string
}

export interface Product{
    prc_ID: number,
    cust_ID: number,
    appCode: string
}