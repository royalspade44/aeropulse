import { Redirect } from "expo-router";
import { useUserContext } from "../../context/UserContext";

export default function CustomerIndex() {
  const { current, resolveHomeRoute } = useUserContext();
  return <Redirect href={resolveHomeRoute(current)} />;
}
