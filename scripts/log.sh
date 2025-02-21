#!/usr/bin/bash

cat /sys/class/drm/card*/device/pp_od_clk_voltage
cat /sys/class/drm/card*/device/power_dpm_force_performance_level

which ryzenadj

cat /sys/devices/system/cpu/amd_pstate/status

cat /sys/devices/system/cpu/cpufreq/boost
cat /sys/devices/system/cpu/cpufreq/policy*/boost

cat /sys/devices/system/cpu/smt/control

cat /sys/devices/system/cpu/cpu*/cpufreq/energy_performance_preference
cat /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

sudo ryzenadj -i


# ----------

cat /sys/devices/system/cpu/cpu*/cpufreq/scaling_available_governors
cat /sys/devices/system/cpu/cpu*/cpufreq/energy_performance_available_preferences
