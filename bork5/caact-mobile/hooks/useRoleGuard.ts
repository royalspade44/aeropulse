import { useMemo } from "react";

import { useUserContext } from "../context/UserContext";

export function useRoleGuard(allowedRoles = []) {
  const { current, initialized } = useUserContext();
  const normalizedRoles = useMemo(
    () =>
      allowedRoles.map((role) =>
        String(role).toLowerCase().replace("-", "_"),
      ),
    [allowedRoles],
  );
  const role = String(current?.role || "").toLowerCase().replace("-", "_");

  return {
    current,
    initialized,
    allowed: initialized && !!current && normalizedRoles.includes(role),
    redirectHref: "/sign-in",
  };
}
