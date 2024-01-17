import decky_plugin
import subprocess
import urllib.request
import json
import ssl

def download_latest_build():
    # ssl._create_default_https_context = ssl._create_unverified_context
    url = "http://api.github.com/repos/aarron-lee/SimpleDeckyTDP/releases/latest"

    gcontext = ssl.SSLContext()

    response = urllib.request.urlopen(url, context=gcontext)
    json_data = json.load(response)

    download_url = json_data.get("assets")[0].get("browser_download_url")

    file_path = '/tmp/SimpleDeckyTDP.tar.gz'

    with urllib.request.urlopen(download_url, context=gcontext) as response, open(file_path, 'wb') as output_file:
        output_file.write(response.read())
        output_file.close()

    return file_path

def ota_update():
    downloaded_filepath = download_latest_build()

    # install downloaded files
    cmd = f'echo {decky_plugin.DECKY_USER_HOME}/homebrew/plugins/SimpleDeckyTDP/ota_update.sh | HOME="{decky_plugin.DECKY_USER_HOME}" sh'

    result = subprocess.run(cmd, shell=True, check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    if result.stderr:
        decky_plugin.logger.error(result.stderr)
    return result