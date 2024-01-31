import { ToggleField, PanelSectionRow } from "decky-frontend-lib";
import { useCpuBoost } from "../../hooks/useCpuBoost";
import { useSmt } from "../../hooks/useSmt";

import { useEffect } from "react";
import { useFetchPowerControlInfo } from "../molecules/PowerControl";

export function CpuFeatureToggles() {
  const { cpuBoost, setCpuBoost } = useCpuBoost();
  const fetchPowerControlInfo = useFetchPowerControlInfo();
  const { smt, setSmt } = useSmt();

  useEffect(() => {
    setTimeout(() => fetchPowerControlInfo(), 700);
  }, [cpuBoost]);

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
      <PanelSectionRow>
        <ToggleField
          label="Enable SMT"
          checked={smt}
          onChange={(enabled: boolean) => {
            setSmt(enabled);
          }}
          highlightOnFocus
        />
      </PanelSectionRow>
    </>
  );
}
