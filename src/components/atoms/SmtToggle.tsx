import { ToggleField, PanelSection, PanelSectionRow } from "decky-frontend-lib";
import { useSmt } from "../../hooks/useSmt";

export function SmtToggle() {
  const { smt, setSmt } = useSmt();
  return (
    <PanelSection title="SMT">
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
    </PanelSection>
  );
}
