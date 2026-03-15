import { defineConfig } from "vite-plus"
import vue from "@vitejs/plugin-vue"
import vueDevTools from "vite-plugin-vue-devtools"
import templateCompilerOptions from "@tresjs/core/template-compiler-options"

// https://vite.dev/config/
export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  lint: { options: { typeAware: true, typeCheck: true } },
  fmt: {
    ignorePatterns: [],
    semi: false,
    objectWrap: "preserve",
    trailingCommas: "all",
    printWidth: 150,
  },
  base: "/ai-pokemon-demo/",
  plugins: [vue(templateCompilerOptions), vueDevTools()],
})
