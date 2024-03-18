import subprocess
import shutil
from time import sleep
import os
import decky_plugin

ASUSCTL_PATH = shutil.which('asusctl')
PLATFORM_PROFILE_PATH  = '/sys/firmware/acpi/platform_profile'

FAST_WMI_PATH ='/sys/devices/platform/asus-nb-wmi/ppt_fppt'
SLOW_WMI_PATH = '/sys/devices/platform/asus-nb-wmi/ppt_pl2_sppt'
STAPM_WMI_PATH = '/sys/devices/platform/asus-nb-wmi/ppt_pl1_spl'

# def set_asusctl_platform_profile(tdp):
#   current_value = ''
#   if os.path.exists(PLATFORM_PROFILE_PATH):
#     with open(PLATFORM_PROFILE_PATH, 'r') as file:
#       current_value = file.read()
#       file.close()

#   if ASUSCTL_PATH:
#     commands = [ASUSCTL_PATH, 'profile', '-P']

#     if tdp < 13:
#       commands.append('Quiet')
#     elif tdp < 20:
#       commands.append('Balanced')
#     else:
#       commands.append('Performance')

#     if commands[-1].lower() == current_value.strip():
#       # already set, return
#       return

#     results = subprocess.call(commands)

#     if results.stderr:
#       decky_plugin.logger.error(f"{__name__} asusctl error {results.stderr}")

#     sleep(1.0)

#     return results

def set_platform_profile(tdp):
  command = 'quiet'
  if tdp < 13:
    command = 'quiet'
  elif tdp < 20:
    command = 'balanced'
  else:
    command = 'performance'
  try:
    with open(PLATFORM_PROFILE_PATH, 'w') as file:
      file.write(command)
  except Exception as e:
    decky_plugin.logger.error(f"{__name__} platform_profile error {e}")
        
  sleep(1.0)
  return True

def ryzenadj(tdp):
  try:
    # fast limit
    with open(FAST_WMI_PATH, 'w') as file:
      file.write(tdp+2)
      file.close()
    sleep(0.1)

    # slow limit
    with open(SLOW_WMI_PATH, 'w') as file:
      file.write(tdp)
      file.close()
    sleep(0.1)

    # stapm limit
    with open(STAPM_WMI_PATH, 'w') as file:
      file.write(tdp)
      file.close()
    sleep(0.1)
  except Exception as e:
    decky_plugin.logger.error(f"{__name__} asus wmi tdp error {e}")

def supports_wmi_tdp():
  if os.path.exists(FAST_WMI_PATH) and os.path.exists(SLOW_WMI_PATH) and os.path.exists(STAPM_WMI_PATH):
    return True
  return False

def execute_bash_command(command, path):
  cmd = f"echo '{command}' | tee {path}"
  result = subprocess.run(cmd, timeout=1, shell=True, check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
  return result
