// app/api/test/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const output = `Visi dan Misi dari ALVA adalah:\n\n**Visi:** Untuk menjadi Transportasi Elektrik Unggulan dan Membentuk Ulang Keberlanjutan.\n\n**Misi:**\n* Memberikan Solusi yang Lebih Baik\n* Memberikan pilihan mobilitas untuk gaya hidup yang sejalan dengan keberlanjutan.\n* Pelanggan adalah yang Utama.`;

  return NextResponse.json({ output });
}
