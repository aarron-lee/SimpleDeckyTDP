# Custom Device settings

## Experimental Custom TDP method for the Legion Go

This method, once enabled, will use Lenovo's built-in Custom TDP mode.

Note that this requires the `acpi_call` module, if your distro doesn't have it pre-installed, it'll have to be manually installed.

To check if you have `acpi_call`, run `sudo modprobe acpi_call` in terminal. You should see no errors.

This also requires the v28 or newer bios.

### Setup Instructions:

Make sure you have the latest SimpleDeckyTDP installed, and enable STAMP in the bios.

install/update to latest SimpleDeckyTDP with: `curl -L https://github.com/aarron-lee/SimpleDeckyTDP/raw/main/install.sh | sh`

If your device is compatible, enable the `Lenovo Custom TDP Mode` advanced setting in options:

![advancedOptions](../../img/advanced_options.png)

You'll know it's working if it changes the power LED to purple when you set TDP via plugin
