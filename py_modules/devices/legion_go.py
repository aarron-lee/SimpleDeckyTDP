import decky_plugin
import decky_acpi
from time import sleep

def ryzenadj(tdp):
  try:
    tdp_mode = decky_acpi.get_tdp_mode()

    if tdp_mode != "custom":
      decky_acpi.set_tdp_mode("custom")

    sleep(0.3)

    decky_acpi.set_slow_tdp(tdp)
    decky_acpi.set_steady_tdp(tdp)
    decky_acpi.set_fast_tdp(tdp + 2)

    sleep(0.3)
  except Exception as e:
    decky_plugin.logger.error(f"legion go ryzenadj error {e}")
