import { visionTool } from "@sanity/vision"
import { defineConfig } from "sanity"
import { structureTool } from "sanity/structure"

import { apiVersion, dataset, projectId } from "./src/sanity/env"
import { schemaTypes } from "./src/sanity/schemaTypes"
import { structure } from "./src/sanity/structure"

// Studio mounted at /studio (see src/app/studio/[[...tool]]/page.tsx).
export default defineConfig({
  name: "default",
  title: "Portfolio",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
  schema: { types: schemaTypes },
})
