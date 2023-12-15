import os
import subprocess
import shutil
import logging

RYZENADJ_PATH = shutil.which('ryzenadj')
BOOST_PATH="/sys/devices/system/cpu/cpufreq/boost"
AMD_PSTATE_PATH="/sys/devices/system/cpu/amd_pstate/status"

def ryzenadj(tdp: int):
    tdp = tdp*1000

    try:
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