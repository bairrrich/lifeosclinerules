import { moduleColors } from "./modules"
import { ModuleType } from "./tokens"

export function getModuleColor(
  module: ModuleType,
  variant: "light" | "DEFAULT" | "soft" | "text" | "border" | "shadow" = "DEFAULT"
) {
  return moduleColors[module][variant]
}
