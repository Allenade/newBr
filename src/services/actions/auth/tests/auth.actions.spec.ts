import { signUpWithEmailAndPassword } from "@/services/actions/auth/auth.actions";
import { AuthActions } from "@/services/actions/auth/interfaces/auth.actions.dto";

describe("Auth Actions", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it("Should sign up a user with email and password", async () => {
    const mockSignUpData: AuthActions.SignUpProps = {
      email: "ddd@gmail.com",
      password: "123456",
      firstName: "test",
      lastName: "test",
    };
    const data = await signUpWithEmailAndPassword(mockSignUpData);

    expect(data).toBeDefined();
  });
});
