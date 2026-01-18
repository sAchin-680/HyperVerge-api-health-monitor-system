export async function sendWebhook(url: string, message: string) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      timestamp: new Date().toISOString(),
    }),
  });

  if (!res.ok) {
    throw new Error(`Webhook failed: ${res.status} ${res.statusText}`);
  }

  return res;
}
