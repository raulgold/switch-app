import fs from "fs";
import path from "path";

/**
 * Lê valor literal do .env.local/.env sem expansão de $ (evita truncar senhas como SwItCh@$money).
 */
export function lerValorBrutoEnv(nome: string): string | undefined {
  for (const arquivo of [".env.local", ".env"]) {
    try {
      const caminho = path.join(process.cwd(), arquivo);
      const texto = fs.readFileSync(caminho, "utf8");
      const prefixo = `${nome}=`;
      for (const linha of texto.split(/\r?\n/)) {
        const t = linha.trim();
        if (!t || t.startsWith("#")) continue;
        if (!t.startsWith(prefixo)) continue;
        let v = t.slice(prefixo.length);
        if (
          (v.startsWith('"') && v.endsWith('"')) ||
          (v.startsWith("'") && v.endsWith("'"))
        ) {
          v = v.slice(1, -1);
        }
        return v;
      }
    } catch {
      /* arquivo ausente */
    }
  }
  return undefined;
}
