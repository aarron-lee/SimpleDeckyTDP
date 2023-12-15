import { ToggleField, PanelSection, PanelSectionRow } from "decky-frontend-lib";
import { useCpuBoost } from "../../hooks/useCpuBoost";

export function CpuBoostToggle() {
  const { cpuBoost, setCpuBoost } = useCpuBoost();
  return (
    <PanelSection title="CPU Boost">
      <PanelSectionRow>
        <ToggleField
          label="Enable CPU Boost"
          checked={cpuBoost}
          onChange={(enabled: boolean) => {
            setCpuBoost(enabled);
          }}
          highlightOnFocus
        />
      </PanelSectionRow>
    </PanelSection>
  );
}
