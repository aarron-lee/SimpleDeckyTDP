import subprocess
import shutil
from time import sleep
import os
import decky_plugin

ASUSCTL_PATH = shutil.which('asusctl')
PLATFORM_PROFILE_PATH  = '/sys/firmware/acpi/platform_profile'

def set_asusctl_platform_profile(tdp):
  current_value = ''
  if os.path.exists(PLATFORM_PROFILE_PATH):
    with open(PLATFORM_PROFILE_PATH, 'r') as file:
      current_value = file.read()
      file.close()

  if ASUSCTL_PATH:
    commands = [ASUSCTL_PATH, 'profile', '-P']

    if tdp < 13:
      commands.append('Quiet')
    elif tdp < 20:
      commands.append('Balanced')
    else:
      commands.append('Performance')

    if commands[-1].lower() == current_value.strip():
      # already set, return
      return

    results = subprocess.call(commands)

    if results.stderr:
      decky_plugin.logger.error(f"{__name__} asusctl error {results.stderr}")

    sleep(1.0)

    return results

def set_platform_profile(tdp):

  if os.path.exists(PLATFORM_PROFILE_PATH):
    with open(PLATFORM_PROFILE_PATH, 'r') as file:
      current_value = file.read()
      file.close()

      command = 'quiet'
      if tdp < 13:
        command = 'quiet'
      elif tdp < 20:
        command = 'balanced'
      else:
        command = 'performance'

      if current_value.strip() == command:
        # already set, return
        return

      result = execute_bash_command(command, PLATFORM_PROFILE_PATH)
      if result.stderr:
        decky_plugin.logger.error(f"{__name__} platform_profile error {result.stderr}")
      sleep(1.0)
      return result


def execute_bash_command(command, path):
  cmd = f"echo '{command}' | tee {path}"
  result = subprocess.run(cmd, timeout=1, shell=True, check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
  return result
