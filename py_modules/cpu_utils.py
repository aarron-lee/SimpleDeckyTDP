import os
import subprocess
import shutil
import logging
import plugin_settings
from devices import legion_go

RYZENADJ_PATH = shutil.which('ryzenadj')
BOOST_PATH="/sys/devices/system/cpu/cpufreq/boost"
AMD_PSTATE_PATH="/sys/devices/system/cpu/amd_pstate/status"
AMD_SMT_PATH="/sys/devices/system/cpu/smt/control"

def modprobe_acpi_call():
    os.system("modprobe acpi_call")
    result = subprocess.run(["modprobe", "acpi_call"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

    if result.stderr:
        logging.error(f"modprobe_acpi_call error: {result.stderr}")
        return False
    return True

def ryzenadj(tdp: int):
    settings = plugin_settings.get_saved_settings()
    try:
        if settings.get("overrideRyzenadj"):
            # use custom Tdp instead of ryzenadj
            commands = [settings.get("overrideRyzenadj"), tdp]
            results = subprocess.call(commands)
            return results

        device_name = open("/sys/devices/virtual/dmi/id/product_name", "r").read().strip()

        if device_name == "83E1" and modprobe_acpi_call():
            # legion go
            return legion_go.ryzenadj(tdp)

        tdp = tdp*1000

        if RYZENADJ_PATH:
            commands = [RYZENADJ_PATH, '--stapm-limit', f"{tdp}", '--fast-limit', f"{tdp}", '--slow-limit', f"{tdp}"]

            results = subprocess.call(commands)
            return results
    except Exception as e:
        logging.error(e)

def set_cpu_boost(enabled = True):
    try:
        logging.debug(f"set_cpu_boost to {enabled}")

        if os.path.exists(AMD_PSTATE_PATH):
            pstate = 'active' if enabled else 'passive'
            open(AMD_PSTATE_PATH, 'w').write(pstate)

        if os.path.exists(BOOST_PATH):
            with open(BOOST_PATH, 'w') as file:
                if enabled:
                    file.write('1')
                else:
                    file.write('0')

        return True
    except Exception as e:
        logging.error(e)
        return False

def set_smt(enabled = True):
    try:
        logging.debug(f"set_smt to {enabled}")

        if os.path.exists(AMD_SMT_PATH):
            with open(AMD_SMT_PATH, 'w') as file:
                if enabled:
                    file.write('on')
                else:
                    file.write('off')

        return True
    except Exception as e:
        logging.error(e)
        return False