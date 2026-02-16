import { genesisIcons } from "@formkit/icons"
import { rootClasses } from "./formkit.theme"
import { defineFormKitConfig } from '@formkit/vue'

export default defineFormKitConfig(() => ({
  icons: { ...genesisIcons },
  config: { rootClasses }
}))
