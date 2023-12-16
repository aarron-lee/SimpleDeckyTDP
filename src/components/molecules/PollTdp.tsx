import {
  ToggleField,
  SliderField,
  PanelSection,
  PanelSectionRow,
} from "decky-frontend-lib";
import {
  usePollInfo,
  useSetPoll,
  useSetPollRate,
} from "../../hooks/usePollState";

export function PollTdp() {
  const { enabled, pollRate } = usePollInfo();
  const setPoll = useSetPoll();
  const setPollRate = useSetPollRate();

  return (
    <PanelSection title="Poll TDP">
      <PanelSectionRow>
        <ToggleField
          label="Enable Polling"
          checked={enabled}
          onChange={(enabled: boolean) => {
            setPoll(enabled);
          }}
          highlightOnFocus
        />
      </PanelSectionRow>
      {enabled && (
        <PanelSectionRow>
          <SliderField
            label="Poll Rate"
            description={`Set TDP every ${pollRate / 1000} seconds`}
            value={pollRate / 1000}
            step={1}
            showValue
            min={1}
            max={20}
            bottomSeparator="none"
            onChange={(rate_in_sec) => setPollRate(rate_in_sec * 1000)}
          />
        </PanelSectionRow>
      )}
    </PanelSection>
  );
}
