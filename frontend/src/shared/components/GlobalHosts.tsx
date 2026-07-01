"use client"

import { Toaster } from "sonner"

import { ConfirmDialogHost } from "./ConfirmDialog"

/** App-wide UI hosts mounted once at the root: toast notifications + the confirm dialog. */
export function GlobalHosts() {
  return (
    <>
      <Toaster position="top-right" richColors  />
      <ConfirmDialogHost />
    </>
  )
}
