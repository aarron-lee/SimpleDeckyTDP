import decky_plugin
from typing import Sequence

# credit for all functions in this file go to hhd-adjustor + antheas
# https://github.com/hhd-dev/adjustor/blob/072411bff14bb5996b0fe00da06f36d17f31a389/src/adjustor/core/lenovo.py#L13

def set_tdp_mode(mode):
    decky_plugin.logger.info(f"Setting tdp mode to '{mode}'.")
    match mode:
        case "quiet":
            b = 0x01
        case "balanced":
            b = 0x02
        case "performance":
            b = 0x03
        case "custom":
            b = 0xFF
        case _:
            decky_plugin.logger.error(f"TDP mode '{mode}' is unknown. Not setting.")
            return False

    return call(r"\_SB.GZFD.WMAA", [0, 0x2C, b])

def get_tdp_mode():
    decky_plugin.logger.debug(f"Retrieving TDP Mode.")
    if not call(r"\_SB.GZFD.WMAA", [0, 0x2D, 0], risky=False):
        decky_plugin.logger.error(f"Failed retrieving TDP Mode.")
        return None

    match read():
        case 0x01:
            return "quiet"
        case 0x02:
            return "balanced"
        case 0x03:
            return "performance"
        case 0xFF:
            return "custom"
        case v:
            decky_plugin.logger.error(f"TDP mode '{v}' is unknown")
            return None

def set_steady_tdp(val: int):
    decky_plugin.logger.info(f"Setting steady TDP to {val}.")
    return set_feature(0x0102FF00, val)


def set_fast_tdp(val: int):
    decky_plugin.logger.info(f"Setting fast TDP to {val}.")
    return set_feature(0x0103FF00, val)


def set_slow_tdp(val: int):
    decky_plugin.logger.info(f"Setting slow TDP to {val}.")
    return set_feature(0x0101FF00, val)

def set_feature(id: int, value: int):
    return call(
        r"\_SB.GZFD.WMAE",
        [
            0,
            0x12,
            int.to_bytes(id, length=4, byteorder="little", signed=False)
            + int.to_bytes(value, length=4, byteorder="little", signed=False),
        ],
    )

def call(method: str, args: Sequence[bytes | int], risky: bool = True):
    cmd = method
    for arg in args:
        if isinstance(arg, int):
            cmd += f" 0x{arg:02x}"
        else:
            cmd += f" b{arg.hex()}"

    log = decky_plugin.logger.info if risky else decky_plugin.logger.debug
    log(f"Executing ACPI call:\n'{cmd}'")

    try:
        with open("/proc/acpi/call", "wb") as f:
            f.write(cmd.encode())
        return True
    except Exception as e:
        decky_plugin.logger.error(f"ACPI Call failed with error:\n{e}")
        return False
    
def read():
    with open("/proc/acpi/call", "rb") as f:
        d = f.read().decode().strip()

    if d == "not called\0":
        return None
    if d.startswith("0x") and d.endswith("\0"):
        return int(d[:-1], 16)
    if d.startswith("{") and d.endswith("}\0"):
        bs = d[1:-2].split(", ")
        return bytes(int(b, 16) for b in bs)
    assert False, f"Return value '{d}' supported yet or was truncated."    
