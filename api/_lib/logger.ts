export function logRequest(req: any) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
}

export function logError(error: any) {
  console.error(`[${new Date().toISOString()}] ERROR:`, error);
}
