from devices import rog_ally, lenovo
from plugin_settings import get_nested_setting
import device_utils
from time import sleep

def uses_boolean_charge_limit():
  # Lenovo Legion exposes a fixed firmware ~80% cap (ideapad conservation_mode or
  # power_supply charge_types) - a boolean toggle, not a percentage slider. Gate
  # on capability (node exists) rather than product id.
  # Defer to the native charge-limit interface (charge_control_end_threshold, used
  # by Steam and the ROG Ally path) when it exists - only fall back to the boolean
  # toggle when there's no standard threshold node, so we don't overlap if Steam
  # adds native Legion Go charge-limit support.
  return (
    not device_utils.is_rog_ally_series()
    and not rog_ally.supports_charge_limit()
    and lenovo.supports_charge_limit()
  )

def get_range_info():
  if device_utils.is_rog_ally_series():
    default = 100
    step = 5
    return [[charge_limit_min(), 100], default, step]
  # boolean charge-limit devices have no percentage range
  return None

def charge_limit_min():
  if device_utils.is_rog_ally_series():
    return 70

  return 100

def get_current_charge_limit():
  if device_utils.is_rog_ally_series():
    return rog_ally.get_current_charge_limit()
  if uses_boolean_charge_limit():
    return lenovo.get_current_charge_limit()
  return 100

def supports_charge_limit():
  if device_utils.is_rog_ally_series() and rog_ally.supports_charge_limit():
    return True
  if uses_boolean_charge_limit():
    return True
  return False

def set_charge_limit(limit):
  if not charge_limit_enabled():
    return

  if device_utils.is_rog_ally_series():
    return rog_ally.set_charge_limit(limit)
  if uses_boolean_charge_limit():
    return lenovo.set_charge_limit(True)
  return False

def set_boolean_charge_limit(enabled):
  # Boolean charge-limit devices (Lenovo Legion): apply an explicit on/off
  # state. Used by handle_advanced_option_change, where the persisted setting
  # is still stale, so the value must be passed in directly.
  if uses_boolean_charge_limit():
    return lenovo.set_charge_limit(bool(enabled))
  return False

def get_expected_charge_limit():
  # CHARGE_LIMIT = 'chargeLimit'
  return get_nested_setting('advanced.chargeLimit')

def charge_limit_enabled():
  return get_nested_setting('advanced.enableChargeLimit')

def initialize_charge_limit():
  if not supports_charge_limit():
    return

  if uses_boolean_charge_limit():
    # Only enforce the "on" state automatically. Leave the hardware alone when
    # the feature is disabled so we don't fight a BIOS/other-tool setting.
    if charge_limit_enabled():
      lenovo.set_charge_limit(True)
    return

  if charge_limit_enabled():
    current_limit = get_current_charge_limit()
    expected_limit = get_expected_charge_limit()

    if isinstance(expected_limit, int) and current_limit != expected_limit:
      set_charge_limit(expected_limit)
