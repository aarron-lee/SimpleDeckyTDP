import subprocess
import shutil

RYZENADJ_PATH = shutil.which('ryzenadj')

def ryzenadj(tdp: int):
    tdp = tdp*1000

    if RYZENADJ_PATH:
        commands = [RYZENADJ_PATH, '--stapm-limit', f"{tdp}", '--fast-limit', f"{tdp}", '--slow-limit', f"{tdp}"]

        results = subprocess.call(commands)
        return results
