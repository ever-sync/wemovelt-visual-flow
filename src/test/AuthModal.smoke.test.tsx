import { render, screen } from "@testing-library/react";
import AuthModal from "@/components/modals/AuthModal";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    signIn: vi.fn(),
    signUp: vi.fn(),
    resetPassword: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe("AuthModal smoke", () => {
  it("renders the login flow shell", () => {
    render(<AuthModal open onOpenChange={vi.fn()} mode="login" onSuccess={vi.fn()} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email Address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Login" }).length).toBeGreaterThan(0);
  });
});
