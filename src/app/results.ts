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
