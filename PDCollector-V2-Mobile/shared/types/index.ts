export type Credentials = {
  username?: string;
  password?: string;
  rememberMe: boolean;

  token?: string | null;
  refreshToken?: string | null;
};

export type File = {
  uri: string;
  type: string;
  fileName: string;
};
