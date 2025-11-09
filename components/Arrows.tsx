import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Height, Width } from "../GlobalStyles";

type Direction = "left" | "right" | "up" | "down";

export type ArrowsType = {
  arrows?: Direction;
  size?: string;
  type?: string;
  color?: string;
};

const directionToIcon: Record<Direction, keyof typeof Ionicons.glyphMap> = {
  left: "arrow-back",
  right: "arrow-forward",
  up: "arrow-up",
  down: "arrow-down",
};

const Arrows = ({
  arrows = "right",
  size = "32px",
  type = "stroke",
  color = "#00053d",
}: ArrowsType) => {
  const iconSize = useMemo(() => {
    if (size.endsWith("px")) {
      const parsed = Number.parseInt(size, 10);
      if (!Number.isNaN(parsed)) {
        return parsed - 8 > 0 ? parsed - 8 : parsed;
      }
    }
    return 24;
  }, [size]);

  return (
    <View style={styles.root}>
      <Ionicons name={directionToIcon[arrows]} size={iconSize} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
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

export default Arrows;
