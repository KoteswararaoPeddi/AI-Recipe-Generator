import React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@lib/utils'
import { typography, elementMap } from './typography.styles'
import type { TypographyProps } from './typography.types'

export function Typography<T extends React.ElementType = 'p'>({
  variant = 'body-base',
  weight,
  as,
  asChild = false,
  className,
  children,
  ...props
}: TypographyProps<T>) {
  const Component: React.ElementType = asChild ? Slot : as ?? elementMap[variant]

  return (
    <Component className={cn(typography({ variant, weight }), className)} {...props}>
      {children}
    </Component>
  )
}
