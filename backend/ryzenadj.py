import shutil
import os

RYZENADJ_PATH = shutil.which('ryzenadj')

def ryzenadj(tdp: int):
    t = tdp*1000
    if RYZENADJ_PATH:
        commands = [RYZENADJ_PATH, '--stapm-limit', f"{t}", '--fast-limit', f"{t}", '--slow-limit', f"{t}"]

        command = " ".join(commands)
        results = os.system(command)
        return True
    return False
