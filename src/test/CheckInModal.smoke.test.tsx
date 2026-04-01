import { render, screen } from "@testing-library/react";
import CheckInModal from "@/components/modals/CheckInModal";

vi.mock("@yudiel/react-qr-scanner", () => ({
  Scanner: () => <div data-testid="qr-scanner">scanner</div>,
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user-1" },
  }),
}));

vi.mock("@/hooks/useCheckIn", () => ({
  useCheckIn: () => ({
    checkIns: [],
    isLoading: false,
    error: null,
    streak: 4,
    weeklyPercentage: 50,
    todayCheckedIn: false,
    weekData: [],
    registerGeoCheckIn: vi.fn(),
    registerQrCheckIn: vi.fn(),
    getCheckInsForDate: vi.fn(),
  }),
}));

vi.mock("@/hooks/useGyms", () => ({
  useGyms: () => ({
    gyms: [],
    isLoading: false,
    getNearestGym: vi.fn(() => null),
    getGymById: vi.fn(() => undefined),
  }),
}));

vi.mock("@/hooks/useGeolocation", () => ({
  useGeolocation: () => ({
    status: "idle",
    position: null,
    error: null,
    requestLocation: vi.fn(),
    reset: vi.fn(),
  }),
}));

describe("CheckInModal smoke", () => {
  it("renderiza os dois pontos de entrada de presenca", () => {
    render(<CheckInModal open onOpenChange={vi.fn()} />);

    expect(screen.getByText("Registrar presenca")).toBeInTheDocument();
    expect(screen.getByText("Validar por GPS")).toBeInTheDocument();
    expect(screen.getByText("Escanear QR Code")).toBeInTheDocument();
  });
});
