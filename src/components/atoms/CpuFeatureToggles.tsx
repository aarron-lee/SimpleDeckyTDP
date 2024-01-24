import { ToggleField, PanelSection, PanelSectionRow } from "decky-frontend-lib";
import { useCpuBoost } from "../../hooks/useCpuBoost";
import { useSmt } from "../../hooks/useSmt";
import { useSelector } from "react-redux";
import { supportsEppSelector } from "../../redux-modules/settingsSlice";

export function CpuFeatureToggles() {
  const { cpuBoost, setCpuBoost } = useCpuBoost();
  const supportsEpp = useSelector(supportsEppSelector);
  const { smt, setSmt } = useSmt();

  return (
    <>
      <PanelSectionRow>
        {
          // cpuBoost control only on non-AMD pstate platforms
          !supportsEpp && (
            <ToggleField
              label="Enable CPU Boost"
              checked={cpuBoost}
              onChange={(enabled: boolean) => {
                setCpuBoost(enabled);
              }}
              highlightOnFocus
            />
          )
        }
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
