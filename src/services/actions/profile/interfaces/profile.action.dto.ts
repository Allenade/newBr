import { profiles } from "@/schemas/profiles.schema";

export namespace ProfileActionDto {
  export type Profile = typeof profiles.$inferSelect;
}
