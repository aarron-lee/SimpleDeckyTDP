# Custom Device settings

## Experimental Custom TDP method for the Legion Go

This method, once enabled, will use Lenovo's built-in Custom TDP mode.

Note that this requires the `acpi_call` module, if your distro doesn't have it pre-installed, it'll have to be manually installed.

This also requires the v28 or newer bios.

### Setup Instructions:

1. `sudo modprobe acpi_call`, if this errors out, you need to install `acpi_call`
2. install latest SimpleDeckyTDP: `curl -L https://github.com/aarron-lee/SimpleDeckyTDP/raw/main/install.sh | sh`
3. edit the `$HOME/homebrew/settings/SimpleDeckyTDP/settings.json` file. add `"enableLegionGoCustomTDP": true` to the json

The end result in the `settings.json` file should look something like this:

```
{
  "enableLegionGoCustomTDP": true,
  ...otherStuffAlreadyHere
}
```

4. reboot
5. (optional) enable STAMP in bios

You'll know it's working if it changes the power LED to purple when you set TDP via plugin
