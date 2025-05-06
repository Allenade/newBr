// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AuthActions {
  export type SignUpProps = {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    currency: string;
    country: string;
  };

  export type SignInProps = {
    email: string;
    password: string;
  };
}
