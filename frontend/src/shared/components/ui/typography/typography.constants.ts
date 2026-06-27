export const TYPOGRAPHY_VARIANTS = [
  'display-2xl',
  'display-xl',
  'display-lg',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'body-lg',
  'body-base',
  'body-sm',
  'label-lg',
  'label-base',
  'label-sm',
  'caption',
] as const

export const TYPOGRAPHY_WEIGHTS = [
  'normal',
  'medium',
  'semibold',
  'bold',
  'extrabold',
] as const

export type TypographyVariant = typeof TYPOGRAPHY_VARIANTS[number]
export type TypographyWeight  = typeof TYPOGRAPHY_WEIGHTS[number]
