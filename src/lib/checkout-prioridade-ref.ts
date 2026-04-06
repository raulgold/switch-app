export type RefPrioridadeV1 = {
  v: 1;
  u: string;
  s: string;
  t: "semana_completa" | "diaria";
  dd: string | null;
};

export function encodeRefPrioridade(p: RefPrioridadeV1): string {
  return Buffer.from(JSON.stringify(p), "utf8").toString("base64url");
}

export function decodeRefPrioridade(raw: string): RefPrioridadeV1 | null {
  try {
    const j = JSON.parse(
      Buffer.from(raw, "base64url").toString("utf8")
    ) as RefPrioridadeV1;
    if (j.v !== 1 || !j.u || !j.s || (j.t !== "semana_completa" && j.t !== "diaria")) {
      return null;
    }
    return j;
  } catch {
    return null;
  }
}
