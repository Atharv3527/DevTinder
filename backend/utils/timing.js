export function startTimer(label, meta = {}) {
  const startedAt = performance.now();

  return {
    mark(stepLabel, extra = {}) {
      const elapsedMs = +(performance.now() - startedAt).toFixed(1);
      console.log(`[timing] ${label}:${stepLabel} ${elapsedMs}ms`, {
        ...meta,
        ...extra,
      });
    },
    end(extra = {}) {
      const totalMs = +(performance.now() - startedAt).toFixed(1);
      console.log(`[timing] ${label}:total ${totalMs}ms`, {
        ...meta,
        ...extra,
      });
    },
  };
}
