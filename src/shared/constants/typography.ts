/**
 * Typography presets using the loaded Inter font variants.
 * Apply `fontFamily` explicitly — React Native does NOT inherit it.
 */
export const Typography = {
  regular: {
    fontFamily: 'Inter_400Regular',
  },
  semiBold: {
    fontFamily: 'Inter_600SemiBold',
  },
  bold: {
    fontFamily: 'Inter_700Bold',
  },
} as const;
