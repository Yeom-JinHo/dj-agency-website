export const COMPANY_NAME = {
  VAGUE_FREQUENCY_LABS: "VAGUE FREQUENCY LABS",
  CELEBRATE_AGENCY: "CELEBRATE AGENCY",
  PAYDAY_RECORDS: "PAYDAY RECORDS",
} as const;

export const COMPANY_SHORT_NAME = {
  VAGUE_FREQUENCY_LABS: "VFLABS",
  CELEBRATE_AGENCY: "CELEBRATE",
  PAYDAY_RECORDS: "PAYDAY",
} as const;

export type AppId =
  | "vague-frequency-labs"
  | "payday-records"
  | "celebrate-agency"
  | "juntaro";
