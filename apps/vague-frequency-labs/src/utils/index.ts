import { createMetadataFactory } from "@repo/utils/metadata";
import { metadata as meta } from "@/app/config";

export const baseUrl = meta.site.url;

export const createMetadata = createMetadataFactory(meta);
