import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
    Border,
    Color,
    FontFamily,
    FontSize,
    Padding,
} from "../GlobalStyles";

export type MDSPublicTWTagProps = {
  labelText: string;
  uppercase?: boolean;
  mDSPublicTWTagBackgroundColor?: string;
  labelTextColor?: string;
};

const MDSPublicTWTag = ({
  labelText,
  uppercase = false,
  mDSPublicTWTagBackgroundColor = Color.supportiveRoshi,
  labelTextColor = Color.mainGohan,
}: MDSPublicTWTagProps) => {
  return (
    <View
      style={[styles.container, { backgroundColor: mDSPublicTWTagBackgroundColor }]}
    >
      <Text
        style={[
          styles.label,
          { color: labelTextColor, textTransform: uppercase ? "uppercase" : "none" },
        ]}
      >
        {labelText}
      </Text>
    </View>
  );
};

export default memo(MDSPublicTWTag);

const styles = StyleSheet.create({
  container: {
    borderRadius: Border.br_16,
    paddingHorizontal: Padding.padding_8,
    paddingVertical: Padding.padding_3,
  },
  label: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
  },
});
