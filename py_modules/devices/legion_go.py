import decky_plugin
from time import sleep
from decky_acpi import call, read

def ryzenadj(tdp):
  try:
    tdp_mode = get_tdp_mode()

    if tdp_mode != "custom":
      set_tdp_mode("custom")

    sleep(0.3)

    set_fast_tdp(tdp + 2)
    set_slow_tdp(tdp)
    set_steady_tdp(tdp)

    sleep(0.3)
  except Exception as e:
    decky_plugin.logger.error(f"legion go ryzenadj error {e}")


# credit for functions in this file go to hhd-adjustor + antheas
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