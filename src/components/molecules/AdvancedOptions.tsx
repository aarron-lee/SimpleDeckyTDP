import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../redux-modules/store";
import {
  AdvancedOption,
  getAdvancedOptionsInfoSelector,
  getSteamPatchEnabledSelector,
  supportsCustomAcPowerSelector,
  updateAdvancedOption,
} from "../../redux-modules/settingsSlice";
import { get } from "lodash";
import ErrorBoundary from "../ErrorBoundary";
import ArrowToggleButton from "../atoms/ArrowToggleButton";
import {
  DeckyRow,
  DeckySection,
  DeckySlider,
  DeckyToggle,
} from "../atoms/DeckyFrontendLib";
import { useIsDesktop } from "../../hooks/desktopHooks";
import {
  AdvancedOptionsEnum,
  AdvancedOptionsType,
  DesktopAdvancedOptions,
} from "../../backend/utils";

export const useIsSteamPatchEnabled = () => {
  const steamPatchEnabled = useSelector(getSteamPatchEnabledSelector);

  return steamPatchEnabled;
};

const calculateDisabled = (
  option: AdvancedOption,
  advancedState: { [k: string]: boolean }
) => {
  if (option.disabled) {
    // there is component disable logic to parse
    const { disabled } = option;

    if (disabled.ifFalsy) {
      // ifFalsy = arr of advancedOptions
      const { ifFalsy } = disabled;

      for (let i = 0; i < ifFalsy.length; i++) {
        if (!advancedState[ifFalsy[i]]) {
          return true;
        }
      }
    }
  }

  return false;
};

const AdvancedOptions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isDesktop = useIsDesktop();
  const { advancedState, advancedOptions } = useSelector(
    getAdvancedOptionsInfoSelector
  );
  const supportsCustomAcPowerManagement = useSelector(
    supportsCustomAcPowerSelector
  );

  if (advancedOptions.length === 0) {
    return null;
  }

  return (
    <DeckySection title="Advanced Options">
      <ErrorBoundary title="Advanced Options">
        <ArrowToggleButton
          cacheKey="simpleDeckyTDP.advancedOptionButton"
          defaultOpen
        >
          {advancedOptions.map((option, idx) => {
            const { name, type, statePath, defaultValue, description } = option;
            const value = get(advancedState, statePath, defaultValue);

            if (isDesktop) {
              if (!DesktopAdvancedOptions.includes(statePath)) {
                return null;
              }
              if (
                statePath === AdvancedOptionsEnum.AC_POWER_PROFILES &&
                !supportsCustomAcPowerManagement
              ) {
                // only enable AC TDP profiles on Desktop if custom AC is supported
                return null;
              }
            }

            if (type === AdvancedOptionsType.BOOLEAN) {
              return (
                <DeckyRow>
                  <DeckyToggle
                    key={idx}
                    label={name}
                    checked={value}
                    description={description}
                    highlightOnFocus
                    bottomSeparator="none"
                    onChange={(enabled: boolean) => {
                      return dispatch(
                        updateAdvancedOption({ statePath, value: enabled })
                      );
                    }}
                    disabled={calculateDisabled(option, advancedState)}
                  />
                </DeckyRow>
              );
            }
            if (type === AdvancedOptionsType.NUMBER_RANGE) {
              const {
                range,
                step,
                showValue = true,
                showName = true,
                showDescription = true,
                valueSuffix,
              } = option;
              const [min, max] = range;

              if (typeof value !== "number") return null;

              return (
                <DeckyRow>
                  <DeckySlider
                    value={value}
                    key={idx}
                    label={showName ? name : undefined}
                    min={min}
                    max={max}
                    step={step}
                    description={showDescription ? description : undefined}
                    onChange={(newValue: number) => {
                      return dispatch(
                        updateAdvancedOption({ statePath, value: newValue })
                      );
                    }}
                    valueSuffix={valueSuffix}
                    disabled={calculateDisabled(option, advancedState)}
                    highlightOnFocus
                    showValue={showValue}
                  />
                </DeckyRow>
              );
            }

            return null;
          })}
        </ArrowToggleButton>
      </ErrorBoundary>
    </DeckySection>
  );
};

export default AdvancedOptions;
