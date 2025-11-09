import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
    Border,
    Color,
    FontFamily,
    FontSize,
    Gap,
    Height,
    LineHeight,
    StyleVariable,
    Width,
} from "../GlobalStyles";
import Time from "./Time";

export type CardType = {
  buttonText?: string;
  size?: string;
  time?: "calendar" | "calendar-add" | "time" | "calendar-date";
  type?: string;
  calendar?: ReactNode;
  timePosition?: string;
  timeTop?: string;
  timeLeft?: string;
  timeWidth?: string;
  timeHeight?: string;
  calendarIconHeight?: string;
  calendarIconWidth?: string;
  calendarIconTop?: string;
  calendarIconRight?: string;
  calendarIconBottom?: string;
  calendarIconLeft?: string;
};

const Card = ({
  buttonText,
  size,
  time = "calendar",
  type,
  calendar,
  timePosition,
  timeTop,
  timeLeft,
  timeWidth,
  timeHeight,
  calendarIconHeight,
  calendarIconWidth,
  calendarIconTop,
  calendarIconRight,
  calendarIconBottom,
  calendarIconLeft,
}: CardType) => {
  return (
    <View style={[styles.card, styles.cardBorder]}>
      <View style={styles.cardInner}>
        <View style={[styles.timeWrapper, styles.cardBorder]}>
          <Time
            size={size}
            time={time}
            type={type}
            timePosition={timePosition}
            timeTop={timeTop}
            timeLeft={timeLeft}
            timeWidth={timeWidth}
            timeHeight={timeHeight}
            calendar={calendar}
            calendarIconHeight={calendarIconHeight}
            calendarIconWidth={calendarIconWidth}
            calendarIconTop={calendarIconTop}
            calendarIconRight={calendarIconRight}
            calendarIconBottom={calendarIconBottom}
            calendarIconLeft={calendarIconLeft}
          />
        </View>
      </View>
      <Text style={styles.buttonText}>{buttonText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  cardBorder: {
    overflow: "hidden",
    borderStyle: "solid",
  },
  card: {
    flex: 1,
    borderRadius: Border.br_8,
    backgroundColor: Color.white,
    borderColor: Color.piccolo,
    borderWidth: 1,
    padding: StyleVariable.surfaceBorderRadiusRadiusSLg,
    gap: Gap.gap_8,
    alignSelf: "stretch",
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
  },
  timeWrapper: {
    height: Height.height_36,
    width: Width.width_36,
    borderRadius: Border.br_58,
    borderColor: Color.jiren,
    borderWidth: 2,
  },
  buttonText: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_24,
    fontWeight: "700",
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainBulma,
    textAlign: "left",
    alignSelf: "stretch",
  },
});

export default Card;
