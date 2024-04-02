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
} from "decky-frontend-lib";

export const DeckySection = PanelSection;

export const DeckyRow = PanelSectionRow;

export const DeckyToggle = ToggleField;

export const DeckySlider = SliderField;

export const DeckyButton = ButtonItem;

export const DeckyField = Field;

// from decky-frontend-lib
export type NotchLabel = {
  notchIndex: number;
  label: string;
  value?: number;
};

export function getRouter() {
  return Router;
}
