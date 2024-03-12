import { ToggleField, PanelSectionRow } from "decky-frontend-lib";
import { useCpuBoost } from "../../hooks/useCpuBoost";

import { useEffect } from "react";
import { useFetchPowerControlInfo } from "../molecules/PowerControl";

export function CpuFeatureToggles() {
  const { cpuBoost, setCpuBoost } = useCpuBoost();
  const fetchPowerControlInfo = useFetchPowerControlInfo();

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
    </>
  );
}
