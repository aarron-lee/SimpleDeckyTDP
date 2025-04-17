from enum import Enum
import subprocess
import os
import shutil
import decky_plugin
from time import sleep
import device_utils
from plugin_settings import get_nested_setting

LOCAL_RYZENADJ = f'{decky_plugin.DECKY_USER_HOME}/.local/bin/ryzenadj'
NIX_RYZENADJ = f'{decky_plugin.DECKY_USER_HOME}/.nix-profile/bin/ryzenadj'
FALLBACK_RYZENADJ = f'{decky_plugin.DECKY_USER_HOME}/homebrew/plugins/SimpleDeckyTDP/bin/ryzenadj'

RYZENADJ_PATH = None

def get_ryzenadj_path():
  global RYZENADJ_PATH

  if RYZENADJ_PATH:
    return RYZENADJ_PATH

  if not device_utils.is_intel():
    # allow for custom override of ryzenadj for SteamOS
    if os.path.exists(LOCAL_RYZENADJ):
        RYZENADJ_PATH = LOCAL_RYZENADJ
    elif os.path.exists(NIX_RYZENADJ):
      RYZENADJ_PATH = NIX_RYZENADJ
    else:
      RYZENADJ_PATH = shutil.which('ryzenadj')

    if RYZENADJ_PATH == None and os.path.exists(FALLBACK_RYZENADJ):
      # last resort fallback
      RYZENADJ_PATH = FALLBACK_RYZENADJ

  return RYZENADJ_PATH

def set_ryzenadj_undervolt(new_undervolt_value):
  cmd = f'{get_ryzenadj_path()} --set-coall {new_undervolt_value}'
  result = subprocess.run(cmd, shell=True, check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
  sleep(0.1)
  return result

def set_tdp(tdp: int):
  tdp = tdp * 1000

  if get_ryzenadj_path():
    commands = [
      RYZENADJ_PATH,
      '--stapm-limit', f"{tdp}",
      '--fast-limit', f"{tdp}",
      '--slow-limit', f"{tdp}",
      '--tctl-temp', f"95",
      '--apu-skin-temp', f"95",
      '--dgpu-skin-temp', f"95"
    ]

    if get_advanced_option_value(
      # advanced_options.DefaultSettings.ENABLE_APU_SLOW_LIMIT.value
      'enableApuSlowLimit'
    ):
      commands.append('--apu-slow-limit')
      commands.append(f"{tdp}")

    decky_plugin.logger.info(f'setting TDP via ryzenadj with args {commands}')

    results = subprocess.call(commands)
    return results

def get_advanced_option_value(setting_name):
  # e.g. get_setting(LegionGoSettings.CUSTOM_TDP_MODE.value)
  return get_nested_setting(f'advanced.{setting_name}')
