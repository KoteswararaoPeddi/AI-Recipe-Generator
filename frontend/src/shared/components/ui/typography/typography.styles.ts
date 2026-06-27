import { cva } from 'class-variance-authority'
import type { TypographyVariant } from './typography.constants'

export const typography = cva('', {
  variants: {
    variant: {
      // Display Typography
      'display-2xl': 'font-heading text-display-2xl leading-16 tracking-[-1px]',
      'display-xl':  'font-heading text-display-xl  leading-14 tracking-[-0.5px]',
      'display-lg':  'font-heading text-display-lg  leading-10 tracking-[0em]',

      // Headings
      h1: 'font-heading text-h1 leading-9 tracking-[0em]',
      h2: 'font-heading text-h2 leading-8 tracking-[0em]',
      h3: 'font-heading text-h3 leading-7 tracking-[0em]',
      h4: 'font-heading text-h4 leading-6 tracking-[0em]',
      h5: 'font-heading text-h5 leading-5 tracking-[0em]',
      h6: 'font-heading text-h6 leading-4 tracking-[0em]',

      // Body Text
      'body-lg':   'font-body text-body-lg   leading-6 tracking-[0em] font-normal',
      'body-base': 'font-body text-body-base leading-5 tracking-[0em] font-normal',
      'body-sm':   'font-body text-body-sm   leading-4 tracking-[0em] font-normal',

      // Labels
      'label-lg':   'font-body text-label-lg   leading-5 tracking-[0em]',
      'label-base': 'font-body text-label-base leading-4 tracking-[0em]',
      'label-sm':   'font-body text-label-sm   leading-4 tracking-[0em]',

      // Caption
      caption: 'font-body text-caption leading-4 tracking-[0em]',
    },
    weight: {
      normal:    'font-normal',
      medium:    'font-medium',
      semibold:  'font-semibold',
      bold:      'font-bold',
      extrabold: 'font-extrabold',
    },
  },
  defaultVariants: {
    variant: 'body-base',
    weight:  'normal',
  },
})

export const elementMap = {
  'display-2xl': 'h1',
  'display-xl':  'h1',
  'display-lg':  'h1',
  h1:            'h1',
  h2:            'h2',
  h3:            'h3',
  h4:            'h4',
  h5:            'h5',
  h6:            'h6',
  'body-lg':     'p',
  'body-base':   'p',
  'body-sm':     'p',
  'label-lg':    'label',
  'label-base':  'label',
  'label-sm':    'label',
  caption:       'span',
} as const satisfies Record<TypographyVariant, React.ElementType>
