import { create } from "zustand"

export type ConfirmOptions = {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  /** Styles the confirm button as destructive (red). Default true — most confirms are deletes. */
  destructive?: boolean
}

type ConfirmState = {
  open: boolean
  options: ConfirmOptions | null
  resolve: ((confirmed: boolean) => void) | null
  /** Opens the dialog and resolves to true (confirm) / false (cancel/dismiss). */
  request: (options: ConfirmOptions) => Promise<boolean>
  settle: (confirmed: boolean) => void
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  open: false,
  options: null,
  resolve: null,
  request: (options) =>
    new Promise<boolean>((resolve) => {
      // If a confirm was already pending, dismiss it as cancelled.
      get().resolve?.(false)
      set({ open: true, options, resolve })
    }),
  settle: (confirmed) => {
    get().resolve?.(confirmed)
    set({ open: false, resolve: null })
  },
}))

/**
 * Imperative confirm — `if (await confirm({ ... })) { delete() }`.
 * Resolves true only when the user clicks the confirm button.
 */
export function confirm(options: ConfirmOptions): Promise<boolean> {
  return useConfirmStore.getState().request(options)
}
