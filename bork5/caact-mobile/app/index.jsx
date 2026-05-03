// app/index.jsx
// Entry point: immediately redirect to the right place based on session state.
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { COLORS } from "../constants/theme";
import { useUserContext } from "../context/UserContext";

export default function Index() {
  const { current, initialized, resolveHomeRoute } = useUserContext();

  if (!initialized) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.bg,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return <Redirect href={current ? resolveHomeRoute(current) : "/sign-in"} />;
}
