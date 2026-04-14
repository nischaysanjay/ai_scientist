import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/cn"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary/20 border border-white/5">
      <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-primary/80 to-primary shadow-[0_0_10px_rgba(99,102,241,0.4)]">
        {/* Shimmering Track Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
      </SliderPrimitive.Range>
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-6 w-6 rounded-full border-2 border-primary bg-background ring-offset-background transition-all hover:scale-110 active:scale-125 hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
