import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-primary/40 bg-primary/20 dark:bg-primary/25 text-primary-foreground dark:text-primary-foreground hover:bg-primary/30 dark:hover:bg-primary/35 dark:shadow-[0_0_20px_rgba(167,139,250,0.3)]",
        secondary:
          "border-secondary/40 bg-secondary/80 dark:bg-secondary/60 text-secondary-foreground hover:bg-secondary dark:hover:bg-secondary/70",
        destructive:
          "border-destructive/40 bg-destructive/20 dark:bg-destructive/30 text-destructive-foreground hover:bg-destructive/30 dark:hover:bg-destructive/40",
        outline: 
          "text-foreground border-border bg-background/60 dark:bg-background/40 hover:bg-accent/20 dark:hover:bg-accent/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
