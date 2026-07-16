export function compareVersions(current, latest) {
  const currentParts = current.split(".").map(Number);
  const latestParts = latest.split(".").map(Number);

  const length = Math.max(currentParts.length, latestParts.length);

  for (let i = 0; i < length; i++) {
    const a = currentParts[i] || 0;
    const b = latestParts[i] || 0;

    if (a > b) return 1;
    if (a < b) return -1;
  }

  return 0;
}