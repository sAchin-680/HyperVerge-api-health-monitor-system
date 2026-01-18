export function formatAlertMessage(
  monitorUrl: string,
  status: string,
  details?: any
): string {
  const timestamp = new Date().toISOString();

  if (status === 'DOWN') {
    return `⚠️ ALERT: ${monitorUrl} is DOWN\n\nTime: ${timestamp}\nDetails: ${JSON.stringify(details, null, 2)}`;
  }

  return `✅ RECOVERED: ${monitorUrl} is back UP\n\nTime: ${timestamp}`;
}

export function formatWebhookPayload(
  alertId: string,
  monitorUrl: string,
  status: string,
  details?: any
) {
  return {
    alertId,
    monitorUrl,
    status,
    timestamp: new Date().toISOString(),
    details,
  };
}
