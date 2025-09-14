// LOKASI: src/lib/report.ts
export async function reportProduct(productId: string, reason: string) {
  const resp = await fetch('/api/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // token akan ikut via cookie 'token' dari AuthContext; jika Anda ingin, bisa tambahkan Authorization Bearer di sini
    body: JSON.stringify({ productId, reason }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err?.error || `Failed: ${resp.status}`);
  }
  return resp.json();
}
