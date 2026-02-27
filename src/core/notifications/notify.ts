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

export const notify = {
  toast: baseToast,
  info(input: Content) {
    return baseToast({ ...toParts(input), variant: "default" })
  },
  success(input: Content) {
    return baseToast({ ...toParts(input), variant: "success" })
  },
  error(input: Content) {
    return baseToast({ ...toParts(input), variant: "destructive" })
  },
}

export type { Content as NotifyContent }
