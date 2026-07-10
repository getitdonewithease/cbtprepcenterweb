export const formatDuration = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return "-";
  }

  const totalSeconds = Math.round(value);

  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
};