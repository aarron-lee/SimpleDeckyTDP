import { useCpuBoost } from "../../hooks/useCpuBoost";
import { useEffect } from "react";
import { useFetchPowerControlInfo } from "../molecules/PowerControl";
import { DeckyRow, DeckyToggle } from "./DeckyFrontendLib";

export function CpuFeatureToggles() {
  const { cpuBoost, setCpuBoost } = useCpuBoost();
  const fetchPowerControlInfo = useFetchPowerControlInfo();

  useEffect(() => {
    setTimeout(() => fetchPowerControlInfo(), 700);
  }, [cpuBoost]);

  return (
    <DeckyRow>
      <DeckyToggle
        label="Enable CPU Boost"
        checked={cpuBoost}
        onChange={(enabled: boolean) => {
          setCpuBoost(enabled);
        }}
        highlightOnFocus
      />
    </DeckyRow>
  );
}
