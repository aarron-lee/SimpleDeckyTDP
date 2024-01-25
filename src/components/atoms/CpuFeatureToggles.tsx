import { ToggleField, PanelSectionRow } from "decky-frontend-lib";
import { useCpuBoost } from "../../hooks/useCpuBoost";
import { useSelector } from "react-redux";
import { supportsEppSelector } from "../../redux-modules/settingsSlice";

export function CpuFeatureToggles() {
  const { cpuBoost, setCpuBoost } = useCpuBoost();
  const supportsEpp = useSelector(supportsEppSelector);

  return (
    <>
      {
        // cpuBoost control only on non-AMD pstate platforms
        !supportsEpp && (
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
        )
      }
    </>
  );
}
