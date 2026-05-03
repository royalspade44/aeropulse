// utils/confirmAction.jsx
import { Alert, Platform } from "react-native";

export async function confirmAction({
  title = "Confirm Action",
  message = "Are you sure?",
  confirmText = "Confirm",
  destructive = false,
  onConfirm,
}) {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    const confirmed = window.confirm(`${title}\n\n${message}`);
    if (!confirmed) return false;

    await Promise.resolve(onConfirm?.());
    return true;
  }

  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => resolve(false),
        },
        {
          text: confirmText,
          style: destructive ? "destructive" : "default",
          onPress: () => {
            Promise.resolve(onConfirm?.())
              .then(() => resolve(true))
              .catch((error) => {
                console.error(`${title} confirm action failed:`, error);
                resolve(false);
              });
          },
        },
      ],
      { cancelable: true }
    );
  });
}