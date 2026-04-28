import type React from "react"
import { toast as baseToast } from "@/components/ui/use-toast"
import type { ToastActionElement } from "@/components/ui/toast"

type Content =
  | string
  | {
      title?: React.ReactNode
      description?: React.ReactNode
      action?: ToastActionElement
      duration?: number
    }

const toParts = (input: Content) =>
  typeof input === "string" ? { description: input } : input

const withDefaultDuration = (input: Content, fallbackDuration: number) => {
  const parts = toParts(input)
  return {
    ...parts,
    duration: parts.duration ?? fallbackDuration,
  }
}

export const notify = {
  toast: baseToast,
  info(input: Content) {
    return baseToast({ ...withDefaultDuration(input, 3000), variant: "default" })
  },
  success(input: Content) {
    return baseToast({ ...withDefaultDuration(input, 2600), variant: "success" })
  },
  error(input: Content) {
    return baseToast({ ...withDefaultDuration(input, 4200), variant: "destructive" })
  },
}

export type { Content as NotifyContent }
