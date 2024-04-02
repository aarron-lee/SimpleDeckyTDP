import { usePollInfo, useSetPollRate } from "../../hooks/usePollState";
import ErrorBoundary from "../ErrorBoundary";
import { DeckyRow, DeckySection, DeckySlider } from "../atoms/DeckyFrontendLib";

export function PollTdp() {
  const { enabled, pollRate } = usePollInfo();
  const setPollRate = useSetPollRate();

  if (!enabled) {
    return null;
  }

  return (
    <DeckySection title="Poll TDP">
      <ErrorBoundary title="Poll TDP">
        <DeckyRow>
          <DeckySlider
            label="Poll Rate"
            description={`Set TDP every ${pollRate / 1000} seconds`}
            value={pollRate / 1000}
            step={1}
            showValue
            min={5}
            max={20}
            bottomSeparator="none"
            onChange={(rate_in_sec) => setPollRate(rate_in_sec * 1000)}
          />
        </DeckyRow>
      </ErrorBoundary>
    </DeckySection>
  );
}
