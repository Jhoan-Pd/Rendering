import { tendenciasAhora } from "@/lib/noticias";

// API pública con las noticias más leídas en este momento (la usa la página CSR).
export const dynamic = "force-dynamic";

export async function GET() {
  const noticias = await tendenciasAhora();
  return Response.json(
    { noticias, servidorEn: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
