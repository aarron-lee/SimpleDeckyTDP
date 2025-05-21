from devices import rog_ally
from plugin_settings import get_nested_setting
import device_utils
from time import sleep

def get_range_info():
  if device_utils.is_rog_ally_series():
    default = 100
    step = 5
    return [[charge_limit_min(), 100], default, step]
  return None

def charge_limit_min():
  if device_utils.is_rog_ally_series():
    return 70

  return 100

def get_current_charge_limit():
  if device_utils.is_rog_ally_series():
    return rog_ally.get_current_charge_limit()
  return 100

def supports_charge_limit():
  if device_utils.is_rog_ally_series() and rog_ally.supports_charge_limit():
    return True
  return False

def set_charge_limit(limit):
  if device_utils.is_rog_ally_series():
    return rog_ally.set_charge_limit(limit)
  return False

def get_expected_charge_limit():
  # CHARGE_LIMIT = 'chargeLimit'
  return get_nested_setting('advanced.chargeLimit')

def initialize_charge_limit():
  if supports_charge_limit():
    current_limit = get_current_charge_limit()
    expected_limit = get_expected_charge_limit()

    if isinstance(expected_limit, int) and current_limit != expected_limit:
      set_charge_limit(expected_limit)