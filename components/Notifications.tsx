import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { Color, Height, Width } from "../GlobalStyles";

export type NotificationsType = {
  /** Variant props */
  notifications?: string;
  size?: string;
  type?: string;
};

const Notifications = ({
  notifications = "bell",
  size = "32px",
  type = "stroke",
}: NotificationsType) => {
  const iconSize = size === "32px" ? 20 : Number.parseInt(size, 10) || 20;
  return (
    <View style={styles.notifications}>
      <Ionicons
        name={notifications === "bell" ? "notifications-outline" : "notifications"}
        size={iconSize}
        color={Color.mainGohan}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  notifications: {
    marginTop: -16,
    marginLeft: -16,
    top: "50%",
    left: "50%",
    width: Width.width_32,
    height: Height.height_32,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Notifications;
