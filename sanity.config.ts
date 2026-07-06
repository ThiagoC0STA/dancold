"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { ptBRLocale } from "@sanity/locale-pt-br";
import { apiVersion, dataset, projectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemaTypes/post";
import { TranslateAction } from "./sanity/actions/translate-action";

export default defineConfig({
  name: "dancold",
  title: "Dancold — Blog",
  basePath: "/studio",
  projectId,
  dataset,
  apiVersion,
  plugins: [structureTool(), ptBRLocale()],
  schema: { types: schemaTypes },
  document: {
    actions: (prev, context) =>
      context.schemaType === "post" ? [...prev, TranslateAction] : prev,
  },
});
