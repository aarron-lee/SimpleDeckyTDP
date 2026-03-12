import { useCpuBoost } from "../../hooks/useCpuBoost";
import { useEffect } from "react";
import { DeckyRow, DeckyToggle } from "./DeckyFrontendLib";
import { useFetchPowerControlInfo } from "../../hooks/useFetchPowerControlInfo";
import t from '../../i18n/i18n';

export function CpuFeatureToggles() {
  const { cpuBoost, setCpuBoost } = useCpuBoost();
  const fetchPowerControlInfo = useFetchPowerControlInfo();

  useEffect(() => {
    setTimeout(() => fetchPowerControlInfo(), 700);
  }, [cpuBoost]);

  return (
    <DeckyRow>
      <DeckyToggle
        label={t('CPU_ENABLE_BOOST', 'Enable CPU Boost')}
        checked={cpuBoost}
        onChange={(enabled: boolean) => {
          setCpuBoost(enabled);
        }}
        highlightOnFocus
      />
    </DeckyRow>
  );
}
