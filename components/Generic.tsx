import * as React from "react";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Height, Width } from "../GlobalStyles";

export type GenericType = {
  users?: React.ReactNode;

  /** Variant props */
  generic?: "users" | "home" | "user";
  size?: "32px" | "24px";

  /** Style props */
  genericPosition?: string;
  genericTop?: number | string;
  genericLeft?: number | string;
  genericWidth?: number | string;
  genericHeight?: number | string;
  usersIconHeight?: number | string;
  usersIconWidth?: number | string;
  usersIconTop?: number | string;
  usersIconRight?: number | string;
  usersIconBottom?: number | string;
  usersIconLeft?: number | string;
};

const getGenericContainerStyle = (styleKey: string) => {
  switch (styleKey) {
    case "home-32px":
    case "users-24px":
    case "user-32px":
      return {
        marginTop: null,
        marginLeft: null,
      };
  }
};
const getStyleValue = (key: string, value: string | number | undefined) => {
  if (value === undefined) return;
  return { [key]: value === "unset" ? undefined : value };
};
const Generic = ({
  generic = "home",
  size = "32px",
  genericPosition,
  genericTop,
  genericLeft,
  genericWidth,
  genericHeight,
  users,
  usersIconHeight,
  usersIconWidth,
  usersIconTop,
  usersIconRight,
  usersIconBottom,
  usersIconLeft,
}: GenericType) => {
  const variantKey = [generic, size].join("-");

  const genericStyle = useMemo(() => {
    return {
      ...getStyleValue("position", genericPosition),
      ...getStyleValue("top", genericTop),
      ...getStyleValue("left", genericLeft),
      ...getStyleValue("width", genericWidth),
      ...getStyleValue("height", genericHeight),
    };
  }, [genericPosition, genericTop, genericLeft, genericWidth, genericHeight]);

  const usersIconStyle = useMemo(() => {
    return {
      ...getStyleValue("height", usersIconHeight),
      ...getStyleValue("width", usersIconWidth),
      ...getStyleValue("top", usersIconTop),
      ...getStyleValue("right", usersIconRight),
      ...getStyleValue("bottom", usersIconBottom),
      ...getStyleValue("left", usersIconLeft),
    };
  }, [
    usersIconHeight,
    usersIconWidth,
    usersIconTop,
    usersIconRight,
    usersIconBottom,
    usersIconLeft,
  ]);

  return (
    <View
      style={[styles.root, getGenericContainerStyle(variantKey), genericStyle]}
    >
      {users}
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

export default Generic;
