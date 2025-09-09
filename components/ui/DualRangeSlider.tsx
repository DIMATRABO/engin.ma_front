'use client'

import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'

import {cn} from '@/lib/utils'

interface DualRangeSliderProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
    labelPosition?: 'top' | 'bottom'
    label?: (value: number | undefined) => React.ReactNode
    reserveTopSpace?: boolean // reserve space for top labels to avoid overlap with field captions
    showLabelsOnDragOnly?: boolean // show value bubbles only while dragging
}

const DualRangeSlider = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    DualRangeSliderProps
>(({className, label, labelPosition = 'top', reserveTopSpace = true, showLabelsOnDragOnly = false, ...props}, ref) => {
    const initialValue = Array.isArray(props.value) ? props.value : [props.min, props.max]
    const [draggingIndex, setDraggingIndex] = React.useState<number | null>(null)

    // Add airspace above if we’re showing top labels
    const rootSpaceClass = reserveTopSpace && label && labelPosition === 'top' ? 'pt-9' : undefined
    const trackOffsetClass = reserveTopSpace && label && labelPosition === 'top' ? 'mt-2' : undefined

    return (
        <SliderPrimitive.Root
            ref={ref}
            className={cn(
                // Root aligns with shadcn/ui slider styles
                'relative flex w-full touch-none select-none items-center data-[orientation=horizontal]:h-6',
                rootSpaceClass,
                className,
            )}
            {...props}
        >
            <SliderPrimitive.Track
                className={cn(
                    // Softer muted track with subtle border
                    'relative h-2 w-full grow overflow-hidden rounded-full bg-secondary/60',
                    'border border-border/50',
                    trackOffsetClass,
                )}
            >
                <SliderPrimitive.Range className="absolute h-full bg-primary/70"/>
            </SliderPrimitive.Track>

            {initialValue.map((value, index) => (
                <React.Fragment key={index}>
                    <SliderPrimitive.Thumb
                        className={cn(
                            // Shadcn-like thumb: slightly larger, bordered, shadow, hover/focus states
                            'relative block h-5 w-5 rounded-full border border-primary/70 bg-background shadow-sm',
                            'transition-transform duration-150 ease-out will-change-transform hover:scale-105',
                            'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                            'disabled:pointer-events-none disabled:opacity-50',
                            // Larger touch hit area
                            'before:content-[\'\'] before:absolute before:-inset-2'
                        )}
                        onPointerDown={() => setDraggingIndex(index)}
                        onPointerUp={() => setDraggingIndex((i) => (i === index ? null : i))}
                    >
                        {label && (!showLabelsOnDragOnly || draggingIndex === index) && (
                            <span
                                className={cn(
                                    // Label bubble styles
                                    'pointer-events-none absolute -translate-x-1/2 left-1/2 z-20',
                                    labelPosition === 'top' && '-top-10',
                                    labelPosition === 'bottom' && 'top-7',
                                )}
                            >
                <span
                    className={cn(
                        'inline-flex items-center justify-center rounded-md border border-border bg-popover px-2 py-0.5',
                        'text-[10px] leading-none text-foreground shadow-sm',
                    )}
                >
                  {label(value)}
                </span>
                                {/* notch */}
                                <span
                                    aria-hidden
                                    className={cn(
                                        'absolute left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 border border-border bg-popover',
                                        labelPosition === 'top' && '-bottom-1',
                                        labelPosition === 'bottom' && '-top-1',
                                    )}
                                />
              </span>
                        )}
                    </SliderPrimitive.Thumb>
                </React.Fragment>
            ))}
        </SliderPrimitive.Root>
    )
})
DualRangeSlider.displayName = 'DualRangeSlider'

export {DualRangeSlider}
