export type Status = "analyzing" | "complete" | "error";
export type Stage = "fetch" | "extract" | "analyze" | "finalize";
export interface StageInfo {
  stage: Stage;
  icon: string;
  text: string;
  message: string;
}
