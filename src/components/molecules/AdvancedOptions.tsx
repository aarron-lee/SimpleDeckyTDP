import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../redux-modules/store";
import {
  getAdvancedOptionsInfoSelector,
  updateAdvancedOption,
} from "../../redux-modules/settingsSlice";
import { get } from "lodash";
import { PanelSection, PanelSectionRow, ToggleField } from "decky-frontend-lib";

const AdvancedOptions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { advancedState, advancedOptions } = useSelector(
    getAdvancedOptionsInfoSelector
  );

  if (advancedOptions.length === 0) {
    return null;
  }

  return (
    <PanelSection title="Advanced Options">
      {advancedOptions.map((option, idx) => {
        const { name, type, statePath, defaultValue } = option;
        const value = get(advancedState, statePath, defaultValue);

        if (type === "boolean") {
          return (
            <PanelSectionRow>
              <ToggleField
                key={idx}
                label={name}
                checked={value}
                highlightOnFocus
                bottomSeparator="none"
                onChange={(enabled) => {
                  return dispatch(
                    updateAdvancedOption({ statePath, value: enabled })
                  );
                }}
              />
            </PanelSectionRow>
          );
        }

        return null;
      })}
    </PanelSection>
  );
};

export default AdvancedOptions;
