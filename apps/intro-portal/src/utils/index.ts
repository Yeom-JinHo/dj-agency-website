import { createMetadataFactory } from "@repo/utils/metadata";
import { metadata as meta } from "@/app/config";

export const createMetadata = createMetadataFactory(meta);
