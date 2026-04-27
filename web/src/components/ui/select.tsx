import * as React from "react"
import { Select } from "@base-ui/react/select"
import { CheckmarkBadge02Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { cn } from "@/lib/utils"

const SelectRoot = Select.Root
const SelectTrigger = Select.Trigger
const SelectValue = Select.Value
const SelectPortal = Select.Portal
const SelectPositioner = Select.Positioner
const SelectPopup = Select.Popup
const SelectItem = Select.Item
const SelectIcon = Select.Icon
const SelectItemIndicator = Select.ItemIndicator

export function SelectComponent({
  children,
  value,
  onValueChange,
  className,
}: {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}) {
  return (
    <SelectRoot value={value} onValueChange={onValueChange}>
      {children}
    </SelectRoot>
  )
}

export function SelectTriggerComponent({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) {
  return (
    <SelectTrigger
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {children}
      <SelectIcon>
        <HugeiconsIcon icon={ArrowDown01Icon} size={16} />
      </SelectIcon>
    </SelectTrigger>
  )
}

export function SelectValueComponent({
  className,
}: {
  className?: string
}) {
  return <SelectValue className={cn("", className)} />
}

export function SelectContent({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <SelectPortal>
      <SelectPositioner side="bottom" sideOffset={4} align="start">
        <SelectPopup
          className={cn(
            "z-[9999] min-w-[8rem] overflow-hidden rounded-md border border-border bg-background text-foreground shadow-xl",
            className
          )}
        >
          {children}
        </SelectPopup>
      </SelectPositioner>
    </SelectPortal>
  )
}

export function SelectItemComponent({
  className,
  children,
  value,
}: {
  className?: string
  children: React.ReactNode
  value: string
}) {
  return (
    <SelectItem
      value={value}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectItemIndicator>
          <HugeiconsIcon icon={CheckmarkBadge02Icon} size={16} />
        </SelectItemIndicator>
      </span>
      {children}
    </SelectItem>
  )
}

export {
  SelectRoot as Select,
  SelectTriggerComponent as SelectTrigger,
  SelectValueComponent as SelectValue,
  SelectItemComponent as SelectItem,
}
