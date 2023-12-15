import { ToggleField, PanelSection, PanelSectionRow } from "decky-frontend-lib";
import { useCpuBoost } from "../../hooks/useCpuBoost";
import { useSmt } from "../../hooks/useSmt";

export function CpuFeatureToggles() {
  const { cpuBoost, setCpuBoost } = useCpuBoost();
  const { smt, setSmt } = useSmt();

  return (
    <PanelSection>
      <PanelSectionRow>
        <ToggleField
          label="Enable CPU Boost"
          checked={cpuBoost}
          onChange={(enabled: boolean) => {
            setCpuBoost(enabled);
          }}
          highlightOnFocus
        />
        <ToggleField
          label="Enable SMT"
          checked={smt}
          onChange={(enabled: boolean) => {
            setSmt(enabled);
          }}
          highlightOnFocus
        />
      </PanelSectionRow>
    </PanelSection>
  );
}
