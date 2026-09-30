import { estadoPartido } from "@/lib/en-vivo";
import { esperar } from "@/lib/tiempo";

// API que consume la página CSR. Nunca se cachea: cada petición calcula el estado actual.
export const dynamic = "force-dynamic";

export async function GET() {
  await esperar(250); // latencia simulada del proveedor de datos deportivos
  return Response.json(estadoPartido(), {
    headers: { "Cache-Control": "no-store" },
  });
}
