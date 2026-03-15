import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import templateCompilerOptions from "@tresjs/core/template-compiler-options"

// https://vite.dev/config/
export default defineConfig({
  base: "/ai-pokemon-demo/",
  plugins: [vue(templateCompilerOptions)],
})
