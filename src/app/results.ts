export interface SignupResult {
  custId: number;
  compId: number;
  authCode: string;
  authPass: string;
  result: boolean;
  message: string;
}

export interface LoginResult {
  result: boolean;
  message: string;
}

export interface SuccessLoginResult {
  accessToken: string;
  userName: string;
  role: string;
  userId: string;
  fio: string;
  phone: string;
  mainImage: string;
}
