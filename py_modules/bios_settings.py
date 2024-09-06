import subprocess
import json
import decky_plugin
import file_timeout

def get_bios_settings():
  try:
    with file_timeout(2):
      cmd = 'fwupdmgr get-bios-setting --json'
      result = subprocess.run(cmd, shell=True, check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

      data = json.loads(result.stdout)
      return data
  except Exception as e:
    decky_plugin.logger.error(f'Error get_bios_setting {e}')
    return {
      "BiosSettings": []
    }
