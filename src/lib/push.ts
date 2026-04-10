export const base64UrlToUint8Array = (base64UrlString: string) => {
  const padding = "=".repeat((4 - (base64UrlString.length % 4)) % 4);
  const base64 = (base64UrlString + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
};

export const getCurrentPushSubscription = async () => {
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ) {
    return null;
  }

  const registration = await navigator.serviceWorker.getRegistration();

  if (!registration) {
    return null;
  }

  return registration.pushManager.getSubscription();
};

export const clearBrowserPushSubscription = async () => {
  const subscription = await getCurrentPushSubscription();

  if (!subscription) {
    return null;
  }

  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();

  return endpoint;
};

export const getPushRoute = (type: string, data: Record<string, unknown> | null | undefined) => {
  const explicitRoute = typeof data?.route === "string" ? data.route : null;

  if (explicitRoute) {
    return explicitRoute.startsWith("/") ? explicitRoute : `/${explicitRoute}`;
  }

  switch (type) {
    case "like":
    case "comment":
      return "/home";
    case "goal_completed":
    case "streak":
      return "/frequencia";
    case "reminder":
      return "/home";
    default:
      return "/home";
  }
};
