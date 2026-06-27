import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// Register the project's custom type-scale tokens (see theme.css) as font-sizes.
// Without this, tailwind-merge treats e.g. `text-label-lg` (a size) and
// `text-secondary-foreground` (a colour) as the same `text-*` group and drops
// one — which silently strips button/text colours when merged via cn().
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-2xl",
            "display-xl",
            "display-lg",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "body-lg",
            "body-base",
            "body-sm",
            "label-lg",
            "label-base",
            "label-sm",
            "caption",
          ],
        },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
