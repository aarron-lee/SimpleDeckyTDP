import os
import subprocess
import shutil
import logging

RYZENADJ_PATH = shutil.which('ryzenadj')
BOOST_PATH="/sys/devices/system/cpu/cpufreq/boost"
AMD_PSTATE_PATH="/sys/devices/system/cpu/amd_pstate/status"

def ryzenadj(tdp: int):
    tdp = tdp*1000

    if RYZENADJ_PATH:
        commands = [RYZENADJ_PATH, '--stapm-limit', f"{tdp}", '--fast-limit', f"{tdp}", '--slow-limit', f"{tdp}"]

        results = subprocess.call(commands)
        return results

def set_cpu_boost(enabled = True):
    try:
        logging.debug(f"set_cpu_boost to {enabled}")

        if os.path.exists(AMD_PSTATE_PATH):
            pstate = 'active' if enabled else 'passive'
            open(AMD_PSTATE_PATH, 'w').write(pstate)

            os.system("modprobe acpi_cpufreq")
            result = subprocess.run(["modprobe", "acpi_cpufreq"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

            if result.stderr:
                logging.error(f"modprobe acpi_cpufreq error:\n{result.stderr}")
                open(AMD_PSTATE_PATH, 'w').write('active')
                return False

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