import subprocess
import shutil
import os
import decky_plugin

ASUSCTL_PATH = shutil.which('asusctl')
PLATFORM_PROFILE_PATH  = '/sys/firmware/acpi/platform_profile'

def set_tdp_asusctl(tdp):
    if ASUSCTL_PATH:
        commands = [ASUSCTL_PATH, 'profile', '-P']

        if tdp < 9:
            commands.append('Quiet')
        elif tdp < 19:
            commands.append('Balanced')
        else:
            commands.append('Performance')

        results = subprocess.call(commands)

        if results.stderr:
            decky_plugin.logger.error(f"{__name__} asusctl error {results.stderr}")

        return results

def set_tdp_platform_profile(tdp):
    if os.path.exists(PLATFORM_PROFILE_PATH):
        command = 'quiet'
        if tdp < 9:
            command = 'quiet'
        elif tdp < 19:
            command = 'balanced'
        else:
            command = 'performance'
        result = execute_bash_command(command, PLATFORM_PROFILE_PATH)
        if result.stderr:
            decky_plugin.logger.error(f"{__name__} platform_profile error {result.stderr}")
        return result


def execute_bash_command(command, path):
    cmd = f"echo '{command}' | tee {path}"
    result = subprocess.run(cmd, shell=True, check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return result
