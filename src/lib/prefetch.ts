const runWhenIdle = (callback: () => void) => {
  if (typeof window === "undefined") return;

  if ("requestIdleCallback" in window) {
    const idleWindow = window as typeof window & {
      requestIdleCallback: (cb: () => void) => number;
    };
    idleWindow.requestIdleCallback(callback);
    return;
  }

  window.setTimeout(callback, 180);
};

let authFlowPrefetched = false;
let primaryRoutesPrefetched = false;

export const prefetchAuthFlow = () => {
  if (authFlowPrefetched) return;
  authFlowPrefetched = true;

  runWhenIdle(() => {
    void import("@/components/modals/AuthModal");
  });
};

export const prefetchPrimaryRoutes = () => {
  if (primaryRoutesPrefetched) return;
  primaryRoutesPrefetched = true;

  runWhenIdle(() => {
    void import("@/pages/Home");
    void import("@/pages/Treinos");
    void import("@/pages/Habitos");
    void import("@/pages/Frequencia");
    void import("@/components/modals/CheckInModal");
    void import("@/components/modals/GoalModal");
  });
};
