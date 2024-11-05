class LoginDTO {
  username?: string;
  password?: string;
  rememberLogin?: boolean;
  constructor(username?: string, password?: string, rememberLogin?: boolean) {
    this.username = username;
    this.password = password;
    this.rememberLogin = rememberLogin;
  }
}
export { LoginDTO };
