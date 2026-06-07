import { forwardRef } from "react";
import { TextInput as RNTextInput, type TextInputProps } from "react-native";
import { MAX_FONT_SCALE } from "./Text";

/**
 * `TextInput` with the same font-scaling cap as our shared `Text`. See
 * `./Text` for why a wrapper is required under React 19 + Fabric. Ref is
 * forwarded so callers can still focus/blur the underlying input.
 */
export const TextInput = forwardRef<RNTextInput, TextInputProps>(
  ({ maxFontSizeMultiplier = MAX_FONT_SCALE, ...props }, ref) => (
    <RNTextInput
      ref={ref}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      {...props}
    />
  ),
);

TextInput.displayName = "TextInput";
