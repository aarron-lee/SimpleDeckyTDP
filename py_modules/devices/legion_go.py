import logging
import decky_plugin
import subprocess

# credit for all of the functions in this file goes to corando98 on github
# https://github.com/corando98/

def ryzenadj(tdp):
    try:
        set_smart_fan_mode(0xff)
        set_tdp_value('Slow', tdp)
        set_tdp_value('Steady', tdp)
        set_tdp_value('Fast', tdp + 2)
    except Exception as e:
        decky_plugin.logger.error(f"legion go ryzenadj error {e}")

def set_tdp_value(mode, wattage):
    """
    Sets the Thermal Design Power (TDP) value for the specified mode.
    This function controls the power usage and heat generation of the CPU.

    Args:
        mode (str): The TDP mode ('Slow', 'Steady', 'Fast').
        wattage (int): The desired TDP wattage.

    Returns:
        str: The output from setting the TDP value.
    """
    mode_mappings = {'Slow': '0x01', 'Steady': '0x02', 'Fast': '0x03'}
    mode_code = mode_mappings.get(mode, '0x02')  # Default to 'Steady' if mode is not found

    # Create the command with the desired format
    command = f"echo '\\_SB.GZFD.WMAE 0 0x12 {{0x00, 0xFF, {mode_code}, 0x01, {wattage}, 0x00, 0x00, 0x00}}' |  tee /proc/acpi/call;  cat /proc/acpi/call"

    # Logging the command
    logging.info(f"Command to set TDP value: {command}")

    output = execute_acpi_command(command)

    # Logging the output
    logging.info(f"Output from setting TDP value: {output}")

    return output

def execute_acpi_command(command):
    """
    Executes an ACPI command and returns the output.
    Uses subprocess for robust command execution.

    Args:
        command (str): The ACPI command to be executed.
    
    Returns:
        str: The output from the ACPI command execution.
    """
    try:
        result = subprocess.run(command, shell=True, check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        logging.error(f"Error executing command: {e.stderr}")
        return None

def set_full_fan_speed(enable):
    """
    Enable or disable full fan speed mode.

    Args:
        enable (bool): True to enable, False to disable.

    Returns:
        str: The result of the operation.
    """
    status = '0x01' if enable else '0x00'
    command = f"echo '\\_SB.GZFD.WMAE 0 0x12 {status}04020000' |  tee /proc/acpi/call;  cat /proc/acpi/call"
    return execute_acpi_command(command)

def set_smart_fan_mode(mode_value):
    """
    Set the Smart Fan Mode of the system.

    The Smart Fan Mode controls the system's cooling behavior. Different modes can be set to 
    optimize the balance between cooling performance and noise level.

    Args:
        mode_value (int): The value of the Smart Fan Mode to set.
                          Known values:
                          - 0: Quiet Mode - Lower fan speed for quieter operation.
                          - 1: Balanced Mode - Moderate fan speed for everyday usage.
                          - 2: Performance Mode - Higher fan speed for intensive tasks.
                          - 224: Extreme Mode
                          - 255: Custom Mode - Custom fan curve can be set?.

    Returns:
        str: The result of the operation. Returns None if an error occurs.
    """
    is_already_set = get_smart_fan_mode() == mode_value

    if not is_already_set:
        command = f"echo '\\_SB.GZFD.WMAA 0 0x2C {mode_value}' |  tee /proc/acpi/call;  cat /proc/acpi/call"
        return execute_acpi_command(command)
    return True

def get_smart_fan_mode():
    """
    Get the current Smart Fan Mode of the system.

    This function retrieves the current setting of the Smart Fan mode as specified in the WMI documentation.

    Returns:
        str: The current Smart Fan Mode. The return value corresponds to:
             - '0': Quiet Mode
             - '1': Balanced Mode
             - '2': Performance Mode
             - '224': Extreme Mode
             - '255': Custom Mode
             Returns None if an error occurs.
    """
    command = "echo '\\_SB.GZFD.WMAA 0 0x2D' | tee /proc/acpi/call; cat /proc/acpi/call"
    output = execute_acpi_command(command)
    first_newline_position = output.find('\n')
    output = output[first_newline_position+1:first_newline_position+5].replace('\x00', '')
    return int(output, 16)