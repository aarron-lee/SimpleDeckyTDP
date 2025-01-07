# SimpleDeckyTDP

[![](https://img.shields.io/github/downloads/aarron-lee/SimpleDeckyTDP/total.svg)](https://github.com/aarron-lee/SimpleDeckyTDP/releases)

This is a Linux TDP Decky Plugin with support for AMD and experimental Intel support

- [Features](#features)
- [Compatibility](#compatibility)
- [Requirements](#requirements)
- [Installation](#install)
  - [Prerequisites](#prerequisites)
  - [Quick Install / Update](#quick-install--update)
  - [Manual Install](#manual-install)
- [Manual Build](#manual-build)
- [Uninstall Instructions](#uninstall-instructions)
- [Advanced Configuration](#advanced-configuration)
  - [Desktop App](#desktop-app)
  - [Custom Device Settings](#custom-device-settings)
  - [CPU Boost Controls](#are-there-cpu-boost-controls)
- [Troubleshooting](#troubleshooting)
  - [ROG Ally Troubleshooting](#rog-ally-troubleshooting)
  - [Ryzenadj Troubleshooting](#ryzenadj-troubleshooting)
- [Attribution](#attribution)

![plugin image](./img/plugin_image_updated.png)

<!-- ![steam patch](./img/steam-patch2.png) -->

## Features

- per game TDP Profiles (and optional separate AC Power Profiles)
  - custom TDP limits
- Power Governor and Energy Performance Preference controls
- GPU Controls
  - GPU Controls are not available on Intel
- SMT control
- CPU Boost control\*
  - note, AMD devices require a newer kernel for CPU boost controls
  - CPU boost controls appear automatically if it's available
  <!-- - (optional) Fix Steam Client TDP and GPU Sliders -->
- set TDP on AC Power events and suspend-resume events
- TDP Polling - useful for devices that change TDP in the background
- Desktop App - see [Desktop App Section](#desktop-app) for more details
- Legion Go TDP via WMI calls (allows for TDP control with secure boot, requires acpi_call)
- ROG Ally TDP via WMI calls (allows for TDP control with secure boot)
- etc

## Compatibility

Tested on ChimeraOS, NobaraOS, SteamFork, and Bazzite. Also usable on official SteamOS, but requires a manual ryzenadj installation.

Other distros not tested. Intel support is experimental and still a work in progress.

Currently NOT compatible with Nvidia or other discrete GPU systems, this plugin is currently for APUs only

## Requirements

### AMD

### WARNING: This plugin assumes you already have ryzenadj installed and can be located in your PATH

ChimeraOS, Bazzite Deck Edition, and NobaraOS Deck edition, should already have ryzenadj pre-installed.

To check this, you can run `which ryzenadj` in a terminal/console, which should print out a path to a ryzenadj binary.

e.g.

```
$ which ryzenadj
/usr/bin/ryzenadj
```

If you do not have ryzenadj installed, you will need to get a working copy installed onto your machine.

**For official SteamOS**, you must place your `ryzenadj` binary at the follow location:

`/home/deck/.local/bin/ryzenadj`

See [here](#ryzenadj-troubleshooting) for more info on ryzenadj

### Intel

Intel support was built for the `intel_pstate` scaling driver, and is still an experimental work in progress.

To check if your system is compatible, run the following in terminal:

```bash
cat /sys/devices/system/cpu/cpufreq/policy*/scaling_driver
```

If the scaling is `intel_pstate`, then your device should be compatible

# Install

### Prerequisites

Decky Loader must already be installed. If using ryzenadj for TDP control, test ryzenadj first to make sure it's working on your device.

### Quick Install / Update

Run the following in terminal, then reboot. Note that this works both for installing or updating the plugin

```
curl -L https://github.com/aarron-lee/SimpleDeckyTDP/raw/main/install.sh | sh
```

### Manual Install

Download the latest release from the [releases page](https://github.com/aarron-lee/SimpleDeckyTDP/releases)

Unzip the `tar.gz` file, and move the `SimpleDeckyTDP` folder to your `$HOME/homebrew/plugins` directory

then run:

```
sudo systemctl restart plugin_loader.service
```

then reboot your machine.

## Manual build

Dependencies:

- Node.js v16.14+ and pnpm installed
- fully functional ryzenadj

```bash
git clone https://github.com/aarron-lee/SimpleDeckyTDP.git

cd SimpleDeckyTDP

# if pnpm not already installed
npm install -g pnpm

pnpm install
pnpm update @decky/ui --latest
pnpm run build
```

Afterwards, you can place the entire `SimpleDeckyTDP` folder in the `~/homebrew/plugins` directly, then restart your plugin service

```bash
sudo systemctl restart plugin_loader.service

sudo systemctl reboot
```

### Uninstall Instructions

In Desktop mode, run the following in terminal:

```bash
sudo rm -rf $HOME/homebrew/plugins/SimpleDeckyTDP
sudo systemctl restart plugin_loader.service
```

## Advanced configuration

### Desktop App

[SimpleDeckyTDP-Desktop App](https://github.com/aarron-lee/SimpleDeckyTDP-Desktop) - Desktop port of SimpleDeckyTDP

Intel support is still a work in progress for the Desktop app

- Note: the Desktop app does not have full feature parity with the Decky Plugin. Certain features cannot be implemented yet, such as:
  - per-game profiles
  - AC Profiles (in the Desktop app, AC Profiles are only supported on select devices)
  - etc

The Desktop App also should not be used simultaneously with the SimpleDeckyTDP decky plugin, you should only use one or the other at any given time.

This is because 2-way communication between the plugin and Desktop app is currently not possible.

### Are there CPU boost controls?

Note, CPU Boost should generally be disabled for the ROG Ally and Ally X, CPU boost is known to cause excessive power draw on the Ally and Ally X

CPU Boost controls require a scaling-driver that supports CPU boost. Many distros, by default, use `amd-pstate-epp` as the scaling driver. You must be on a newer kernel for to get CPU Boost controls on `amd-pstate-epp`

CPU boost controls will appear automatically if they're available

If you previously changed to amd_pstate=passive for to get CPU boost controls on BazziteOS, you can revert it via the following:

```
rpm-ostree kargs --delete-if-present=amd_pstate=passive
```

## Troubleshooting

### The "Fix Steam Hardware Controls" option is missing

This is not a bug, Valve updated the Steam client and removed the TDP Slider on non-deck handhelds. Thus, the "Fix Steam Hardware Controls" option is no longer possible.

### TDP Control is not working

First try updating the plugin to the latest version.

```
# update script
curl -L https://github.com/aarron-lee/SimpleDeckyTDP/raw/main/install.sh | sh
```

If this doesn't fix your issue, next try deleting your `$HOME/homebrew/settings/SimpleDeckyTDP/settings.json` file, and rebooting.

If neither works, please create a github issue.

### Buggy behavior after upgrading the plugin to a new version

If you see buggy behavior after upgrading to a new version of the plugin, it might be due to some bad values in an older settings file.

Try deleting the `$HOME/homebrew/settings/SimpleDeckyTDP/settings.json` file.

Note that this will delete any of your saved TDP profiles, so you could optionally copy it somewhere else to keep it as a backup instead.

### My eGPU is being affected by TDP settings

The Steam GPU slider reportedly affects eGPUs, if you are using an eGPU you should disable Steam's GPU toggle.

### ROG Ally Troubleshooting

The ROG ally has some known issues related to CPU Boost and SMT.

- Suspend often gets borked if you disable SMT
  - SDTDP ships a workaround for the SMT bug on the Ally and Ally X, where it will temporarily turn on SMT before suspend
- CPU boost is reportedly misconfigured on the Ally and causes excessive power usage, disabling CPU boost is recommended

### Ryzenadj troubleshooting

To test your ryzenadj, try the following:

```
$ sudo ryzenadj -a 14000 -b 14000 -c 14000
```

the command above sets 14W TDP. You should see the following if sucessful:

```
Sucessfully set stapm_limit to 14000
Sucessfully set fast_limit to 14000
Sucessfully set slow_limit to 14000
```

If you don't see the success messages, your ryzenadj is most likely not working or configured for your device.

You can also test by running the following:

```
$ sudo ryzenadj -i
```

This should print out a table that looks something like the following:

```
CPU Family: Rembrandt
SMU BIOS Interface Version: 18
Version: v0.13.0
PM Table Version: 450005
|        Name         |   Value   |     Parameter      |
|---------------------|-----------|--------------------|
| STAPM LIMIT         |     8.000 | stapm-limit        |
| STAPM VALUE         |     0.062 |                    |
```

If you see an error, you may need to set `iomem=relaxed` as a boot parameter for your kernel, or disable secure boot.

Note that if you have SELinux + early lockdown enabled, ryzenadj will not work when trying to set TDP.

# Attribution

Thanks to the following for making this plugin possible:

- [PowerControl](https://github.com/mengmeet/PowerControl/)
- [hhd-adjustor](https://github.com/hhd-dev/adjustor/)
- [hhd-hwinfo](https://github.com/hhd-dev/hwinfo)
- [decky loader](https://github.com/SteamDeckHomebrew/decky-loader/)
- [ryzenadj](https://github.com/FlyGoat/RyzenAdj)

As well as a big shoutout to SteamFork folks for troubleshooting and testing Intel support
