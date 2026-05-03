import { useUserContext } from "../context/UserContext";

export function useGuestGuard() {
  const { current, initialized, resolveHomeRoute } = useUserContext();

  return {
    current,
    initialized,
    redirectHref: current ? resolveHomeRoute(current) : null,
  };
}
