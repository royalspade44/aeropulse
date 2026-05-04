// constants/config.js
// Central place for environment-level configuration.
import { Platform } from "react-native";

// Change API_BASE to match your development environment:
//   Android emulator  →  http://10.0.2.2:5000
//   iOS simulator / Expo Go on same machine → http://localhost:5000
//   Real device on LAN → http://<your-machine-ip>:5000
// You can override via EXPO_PUBLIC_API_BASE, e.g. http://192.168.1.25:5000/api

const DEFAULT_API_BASE =
	Platform.OS === "android"
		? "http://10.0.2.2:5000/api"
		: "http://localhost:5000/api";

export const API_BASE =
	process.env.EXPO_PUBLIC_API_BASE || DEFAULT_API_BASE;
