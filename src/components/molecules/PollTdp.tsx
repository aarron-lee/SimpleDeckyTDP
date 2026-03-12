import { usePollInfo, useSetPollRate } from "../../hooks/usePollState";
import ErrorBoundary from "../ErrorBoundary";
import { DeckyRow, DeckySection, DeckySlider } from "../atoms/DeckyFrontendLib";
import t from '../../i18n/i18n';

export function PollTdp() {
  const { enabled, pollRate } = usePollInfo();
  const setPollRate = useSetPollRate();

  if (!enabled) {
    return null;
  }

  return (
    <DeckySection title={t('POLL_TDP_TITLE', 'Poll TDP')}>
      <ErrorBoundary title="Poll TDP">
        <DeckyRow>
          <DeckySlider
            label={t('POLL_RATE_LABEL', 'Poll Rate')}
            description={`${t('POLL_RATE_DESC_PREFIX', 'Set TDP every')} ${pollRate / 1000} ${t('POLL_RATE_DESC_SUFFIX', 'seconds')}`}
            value={pollRate / 1000}
            step={1}
            showValue
            min={5}
            max={60}
            bottomSeparator="none"
            onChange={(rate_in_sec: number) => setPollRate(rate_in_sec * 1000)}
          />
        </DeckyRow>
      </ErrorBoundary>
    </DeckySection>
  );
}
