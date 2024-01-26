import { ToggleField, PanelSectionRow } from "decky-frontend-lib";
import { useCpuBoost } from "../../hooks/useCpuBoost";

export function CpuFeatureToggles() {
  const { cpuBoost, setCpuBoost } = useCpuBoost();

  return (
    <>
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
    </>
  );
}
