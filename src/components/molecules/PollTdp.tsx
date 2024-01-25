import {
  ToggleField,
  SliderField,
  PanelSection,
  PanelSectionRow,
} from "decky-frontend-lib";
import {
  useDisableBackgroundPolling,
  usePollInfo,
  useSetPoll,
  useSetPollRate,
} from "../../hooks/usePollState";

export function PollTdp() {
  const { enabled, pollRate } = usePollInfo();
  const setPoll = useSetPoll();
  const setPollRate = useSetPollRate();
  const { disableBackgroundPolling, setDisableBackgroundPolling } =
    useDisableBackgroundPolling();

  return (
    <PanelSection title="Poll TDP">
      {!disableBackgroundPolling && (
        <PanelSectionRow>
          <ToggleField
            label="Enable Polling Rate Override"
            checked={enabled}
            onChange={(enabled: boolean) => {
              setPoll(enabled);
            }}
            highlightOnFocus
          />
        </PanelSectionRow>
      )}
      {enabled && !disableBackgroundPolling && (
        <PanelSectionRow>
          <SliderField
            label="Override Poll Rate"
            description={`Set TDP every ${pollRate / 1000} seconds`}
            value={pollRate / 1000}
            step={1}
            showValue
            min={5}
            max={20}
            bottomSeparator="none"
            onChange={(rate_in_sec) => setPollRate(rate_in_sec * 1000)}
          />
        </PanelSectionRow>
      )}
      <PanelSectionRow>
        <ToggleField
          label="Force Disable Background Polling"
          checked={disableBackgroundPolling}
          onChange={(enabled: boolean) => {
            setDisableBackgroundPolling(enabled);
          }}
          highlightOnFocus
        />
      </PanelSectionRow>
    </PanelSection>
  );
}
