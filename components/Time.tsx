import * as React from "react";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Height, Width } from "../GlobalStyles";

export type TimeType = {
  calendar?: React.ReactNode;

  /** Variant props */
  size?: string;
  time?: "calendar" | "calendar-add" | "time" | "calendar-date";
  type?: string;

  /** Style props */
  timePosition?: string;
  timeTop?: number | string;
  timeLeft?: number | string;
  timeWidth?: number | string;
  timeHeight?: number | string;
  calendarIconHeight?: number | string;
  calendarIconWidth?: number | string;
  calendarIconTop?: number | string;
  calendarIconRight?: number | string;
  calendarIconBottom?: number | string;
  calendarIconLeft?: number | string;
};

const getTimeContainerStyle = (styleKey: string) => {
  switch (styleKey) {
    case "32px-calendar-date-stroke":
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
const Time = ({
  size = "32px",
  time = "calendar",
  type = "stroke",
  timePosition,
  timeTop,
  timeLeft,
  timeWidth,
  timeHeight,
  calendar,
  calendarIconHeight,
  calendarIconWidth,
  calendarIconTop,
  calendarIconRight,
  calendarIconBottom,
  calendarIconLeft,
}: TimeType) => {
  const variantKey = [size, time, type].join("-");

  const time1Style = useMemo(() => {
    return {
      ...getStyleValue("position", timePosition),
      ...getStyleValue("top", timeTop),
      ...getStyleValue("left", timeLeft),
      ...getStyleValue("width", timeWidth),
      ...getStyleValue("height", timeHeight),
    };
  }, [timePosition, timeTop, timeLeft, timeWidth, timeHeight]);

  const calendarIconStyle = useMemo(() => {
    return {
      ...getStyleValue("height", calendarIconHeight),
      ...getStyleValue("width", calendarIconWidth),
      ...getStyleValue("top", calendarIconTop),
      ...getStyleValue("right", calendarIconRight),
      ...getStyleValue("bottom", calendarIconBottom),
      ...getStyleValue("left", calendarIconLeft),
    };
  }, [
    calendarIconHeight,
    calendarIconWidth,
    calendarIconTop,
    calendarIconRight,
    calendarIconBottom,
    calendarIconLeft,
  ]);

  return (
    <View style={[styles.root, getTimeContainerStyle(variantKey), time1Style]}>
      <View style={[styles.iconWrapper, calendarIconStyle]}>{calendar}</View>
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
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
});

export default Time;
