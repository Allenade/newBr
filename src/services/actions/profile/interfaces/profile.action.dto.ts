import { profiles } from "@/schemas/profiles.schema";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ProfileActionDto {
  export type Profile = typeof profiles.$inferSelect;
}
