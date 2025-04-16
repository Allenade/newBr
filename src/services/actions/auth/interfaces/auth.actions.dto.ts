// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AuthActions {
  export type SignUpProps = {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  };

  export type SignInProps = {
    email: string;
    password: string;
  };
}
