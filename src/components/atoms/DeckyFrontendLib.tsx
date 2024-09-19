/*
  Components in this file will be replaced in different frontends,
  such as the Electron SimpleDeckyTDP frontend
*/
import {
  ButtonItem,
  Field,
  PanelSection,
  PanelSectionRow,
  SliderField,
  ToggleField,
  Router,
} from "@decky/ui";

export const DeckySection = PanelSection;

export const DeckyRow = PanelSectionRow;

export const DeckyToggle = ToggleField;

export const DeckySlider = SliderField;

export const DeckyButton = ButtonItem;

export const DeckyField = Field;

// from @decky/ui
export type NotchLabel = {
  notchIndex: number;
  label: string;
  value?: number;
};

export function getCurrentGameId() {
  return `${Router.MainRunningApp?.appid || "default"}`;
}

export function getCurrentGameInfo() {
  const results = {
    id: getCurrentGameId(),
    displayName: `${Router.MainRunningApp?.display_name || "default"}`,
  };

  return results;
}
