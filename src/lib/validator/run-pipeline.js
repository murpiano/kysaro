const {applyDeterministicFixes} = require("./apply-fixes");

function runPipeline(steps, initialPayload = {}) {
  const issues = [];
  const deterministicFixes = [];

  let payload = { ...initialPayload };

  const pipelineResult = {
    issues,
    deterministicFixes,
    payload,
    stop: false
  };

  for (const step of steps) {
    const stepResult = step(payload);

    issues.push(...stepResult.issues);
    deterministicFixes.push(...stepResult.deterministicFixes);

    payload = applyDeterministicFixes(
        payload,
        stepResult.deterministicFixes
    );

    if (stepResult.stop) {
      pipelineResult.stop = true;
      break;
    }
  }

  pipelineResult.payload = payload;

  return pipelineResult;
}

module.exports = {
  runPipeline
};
