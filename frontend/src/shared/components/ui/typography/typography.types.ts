import React from 'react'
import type { TypographyVariant, TypographyWeight } from './typography.constants'

export type { TypographyVariant, TypographyWeight }

// Polymorphic helpers
type AsProp<T extends React.ElementType> = { as?: T }

type PropsToOmit<T extends React.ElementType, P> = keyof (AsProp<T> & P)

type PolymorphicProps<T extends React.ElementType, OwnProps = {}> =
  React.PropsWithChildren<OwnProps & AsProp<T>> &
  Omit<React.ComponentPropsWithoutRef<T>, PropsToOmit<T, OwnProps>>

type TypographyOwnProps = {
  variant?:   TypographyVariant
  weight?:    TypographyWeight
  asChild?:   boolean
  className?: string
}

export type TypographyProps<T extends React.ElementType = 'p'> =
  PolymorphicProps<T, TypographyOwnProps>
