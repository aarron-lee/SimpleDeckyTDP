 #!/bin/bash

sudo ryzenadj -i
cat /sys/class/drm/card?/device/pp_od_clk_voltage
cat /sys/devices/system/cpu/cpufreq/policy*/boost
cat /sys/devices/system/cpu/smt/control
cat /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
cat /sys/devices/system/cpu/cpu*/cpufreq/energy_performance_preference
