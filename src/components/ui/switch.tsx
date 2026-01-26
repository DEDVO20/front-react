import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends React.HTMLAttributes<HTMLDivElement> {
    checked?: boolean
    onCheckedChange?: (checked: boolean) => void
    disabled?: boolean
}

const Switch = React.forwardRef<HTMLDivElement, SwitchProps>(
    ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
        return (
            <div
                ref={ref}
                role="switch"
                aria-checked={checked}
                data-state={checked ? "checked" : "unchecked"}
                className={cn(
                    "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
                    checked ? "bg-[#2563EB]" : "bg-gray-200",
                    className
                )}
                onClick={() => {
                    if (!disabled && onCheckedChange) {
                        onCheckedChange(!checked)
                    }
                }}
                {...props}
            >
                <div
                    className={cn(
                        "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform",
                        checked ? "translate-x-4" : "translate-x-0"
                    )}
                />
            </div>
        )
    }
)
Switch.displayName = "Switch"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
    React.ElementRef<typeof SwitchPrimitives.Root>,
    React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
    <SwitchPrimitives.Root
        className={cn(
            "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-200",
            className
        )}
        {...props}
        ref={ref}
    >
        <SwitchPrimitives.Thumb
            className={cn(
                "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
            )}
        />
    </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
