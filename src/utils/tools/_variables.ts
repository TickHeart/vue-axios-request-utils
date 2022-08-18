import { isClient } from '@vueuse/core'

export const defaultWindow = /* #__PURE__ */ isClient ? window : undefined
export const defaultDocument = /* #__PURE__ */ isClient ? window.document : undefined
export const defaultNavigator = /* #__PURE__ */ isClient ? window.navigator : undefined
export const defaultLocation = /* #__PURE__ */ isClient ? window.location : undefined
export const searchFormThreeColumns = '1 450:1 500:2 700:3'
