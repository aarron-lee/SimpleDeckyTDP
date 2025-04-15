import decky_plugin
from devices import lenovo, rog_ally
import advanced_options
from advanced_options import RogAllySettings

def supports_wmi_tdp():
    return lenovo.supports_wmi_tdp()# or rog_ally.supports_wmi_tdp()

def set_tdp(tdp):
    if lenovo.supports_wmi_tdp():
        lenovo.set_tdp(tdp)
    # if rog_ally.supports_wmi_tdp():
    #     if advanced_options.get_setting(RogAllySettings.USE_PLATFORM_PROFILE.value):
    #       rog_ally.set_platform_profile(tdp)
    #     rog_ally.set_tdp(tdp)