import { useState } from "react";
import { API_URL } from "../../config/api";

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Alert,
  Platform,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";

import { useTheme } from "../../theme/ThemeContext";

export default function ScanReceipt() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // =========================
  // Upload Receipt To Backend
  // =========================

const scanUploadedReceipt = async (
  imageUri: string,
  fileName: string = "receipt.jpg",
  mimeType: string = "image/jpeg"
) => {
  try {
    setIsScanning(true);

    const formData = new FormData();

    if (Platform.OS === "web") {
      // Web: convert the blob URL into an actual Blob
      const imageResponse = await fetch(imageUri);
      const imageBlob = await imageResponse.blob();

      formData.append(
        "receipt",
        imageBlob,
        fileName
      );
    } else {
      // Android/iOS: use the React Native file format
      formData.append(
        "receipt",
        {
          uri: imageUri,
          name: fileName,
          type: mimeType,
        } as any
      );
    }

      console.log("===== Uploading Receipt =====");
      console.log("API URL:", `${API_URL}/api/receipts/scan`);
      console.log("URI:", imageUri);
      console.log("File name:", fileName);
      console.log("Mime type:", mimeType);

      throw new Error(
        `Backend returned status ${response.status}: ${errorText}`
      
      );
    }

      console.log(
        "Backend HTTP status:",
        response.status
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        console.log(
          "Backend error response:",
          errorText
        );

        throw new Error(
          `Backend returned status ${response.status}: ${errorText}`
        );
      }

      const data = await response.json();

      console.log(
        "===== Receipt Scan Result ====="
      );

      console.log(
        JSON.stringify(data, null, 2)
      );

      return;
    }

      const message =
        error instanceof Error
          ? error.message
          : "Unable to upload or scan the receipt.";

      Alert.alert(
        "Scan Error",
        message
      );

      return;
    }

    router.push({
      pathname:
        "/receipt-review" as any,

      params: {
        receipt: JSON.stringify(
          data.receipt
        ),
      },
    });
  } catch (error) {
    console.log(
      "Receipt upload error:",
      error
    );

    Alert.alert(
      "Scan Error",
      "Unable to upload or scan the receipt."
    );
  } finally {
    setIsScanning(false);
  }
};

  // =========================
  // Camera
  // =========================

  const openCamera = async () => {
    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Camera Permission",
          "Camera permission is required."
        );

        return;
      }

      const result =
        await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: false,
          quality: 0.8,
        });

      if (
        result.canceled ||
        result.assets.length === 0
      ) {
        return;
      }

      const asset =
        result.assets[0];

      console.log(
        "===== Camera Result ====="
      );

      console.log(asset);

      setImageUri(asset.uri);

      await scanUploadedReceipt(
        asset.uri,
        asset.fileName ??
          `camera-receipt-${Date.now()}.jpg`,
        asset.mimeType ??
          "image/jpeg"
      );
    } catch (error) {
      console.log(
        "Camera error:",
        error
      );

      Alert.alert(
        "Camera Error",
        error instanceof Error
          ? error.message
          : "Unable to open or scan the receipt."
      );
    }
  };

  // =========================
  // Gallery
  // =========================

  const pickImage = async () => {
    try {
      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: false,
          quality: 1,
        });

      if (
        result.canceled ||
        result.assets.length === 0
      ) {
        return;
      }

      const asset =
        result.assets[0];

      console.log(
        "===== Gallery Result ====="
      );

      console.log(asset);

      setImageUri(asset.uri);

      await scanUploadedReceipt(
        asset.uri,
        asset.fileName ??
          `gallery-receipt-${Date.now()}.jpg`,
        asset.mimeType ??
          "image/jpeg"
      );
    } catch (error) {
      console.log(
        "Gallery error:",
        error
      );

      Alert.alert(
        "Gallery Error",
        error instanceof Error
          ? error.message
          : "Unable to select or scan the image."
      );
    }
  };

  // =========================
  // UI
  // =========================

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Scan Receipt
      </Text>

      <Text style={styles.subtitle}>
        Take a photo or choose a receipt from your gallery.
      </Text>

      <View style={styles.previewArea}>
        {imageUri ? (
          <Image
            source={{
              uri: imageUri,
            }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View
            style={
              styles.emptyPreview
            }
          >
            <Ionicons
              name="receipt-outline"
              size={48}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.placeholder
              }
            >
              No receipt selected
            </Text>
          </View>
        )}

        {isScanning && (
          <View
            style={
              styles.scanningOverlay
            }
          >
            <Ionicons
              name="scan-outline"
              size={42}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.scanningText
              }
            >
              Scanning receipt...
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actionRow}>
        <View style={styles.actionItem}>
          <Pressable
            style={[
              styles.roundActionButton,
              isScanning &&
              styles.disabledButton,
            ]}
            onPress={openCamera}
            disabled={isScanning}
          >
            <Ionicons
              name="camera"
              size={30}
              color="#FFFFFF"
            />
          </Pressable>

          <Text
            style={
              styles.actionLabel
            }
          >
            Take Photo
          </Text>
        </View>

        <View style={styles.actionItem}>
          <Pressable
            style={[
              styles.roundActionButton,
              isScanning &&
              styles.disabledButton,
            ]}
            onPress={pickImage}
            disabled={isScanning}
          >
            <Ionicons
              name="images-outline"
              size={30}
              color="#FFFFFF"
            />
          </Pressable>

          <Text
            style={
              styles.actionLabel
            }
          >
            Choose from Gallery
          </Text>
        </View>
      </View>

      {imageUri &&
        !isScanning && (
          <View
            style={
              styles.successContainer
            }
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color="#16A34A"
            />

            <Text
              style={
                styles.success
              }
            >
              Receipt selected successfully
            </Text>
          </View>
        )}
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#FFFFFF",
      paddingHorizontal: 24,
      paddingTop: 70,
    },

    title: {
      fontSize: 28,
      fontWeight: "700",
      textAlign: "center",
      color: colors.text,
    },

    subtitle: {
      fontSize: 15,
      color: colors.secondaryText,
      textAlign: "center",
      marginTop: 12,
      marginBottom: 25,
    },

    previewArea: {
      width: "100%",
      height: 430,

      backgroundColor:
        "#111827",

      borderRadius: 24,

      justifyContent:
        "center",

      alignItems:
        "center",

      overflow:
        "hidden",

      position:
        "relative",

      borderWidth: 1,
      borderColor: colors.border,
    },

    emptyPreview: {
      flex: 1,

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    placeholder: {
      color: "#FFFFFF",
      fontSize: 16,
      marginTop: 12,
    },

    image: {
      width: "100%",
      height: "100%",
    },

    scanningOverlay: {
      ...StyleSheet.absoluteFillObject,

      backgroundColor:
        "rgba(17,24,39,0.78)",

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    scanningText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
      marginTop: 12,
    },

    actionRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "flex-start",
      gap: 55,
      marginTop: 22,
    },

    actionItem: {
      alignItems: "center",
      width: 125,
    },

    roundActionButton: {
      width: 78,
      height: 78,
      borderRadius: 39,

      backgroundColor:
        colors.primary,

      justifyContent:
        "center",

      alignItems:
        "center",

      shadowColor:
        "#000000",

      shadowOpacity: 0.15,

      shadowRadius: 8,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 5,
    },

    actionLabel: {
      textAlign: "center",
      marginTop: 8,
      fontSize: 14,
      color: "#555555",
    },

    disabledButton: {
      opacity: 0.55,
    },

    successContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 14,
      gap: 6,
    },

    success: {
      fontSize: 15,
      color: "#16A34A",
      fontWeight: "600",
    },
  });