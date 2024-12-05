import {Alert} from "react-native";

export const showErrorAlert = (title: string, error: unknown, fallbackText?: string) => {
  if (error && typeof error === "object" && "message" in error && typeof error.message === 'string') {
    Alert.alert('Error', error.message);
  } else {
    Alert.alert('Error', fallbackText || "Unexpected error");
  }
}