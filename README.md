Hands Free For Chrome
=========

Chrome extension for hands-free exploration of the world wide web!


Development
-----------

Hands Free uses an external web page to take voice input, which allows it to circumvent the microphone restrictions on Chrome extensions. This means it's necessary to run a local HTTPS server in order to work on certain portions of the code. A python script is included which does this automatically when run. Assuming you have Python installed, the server can be started by just running the script local-server.py in the website subdirectory.

Once the server is running, open Chrome, go to `Settings > Extensions > Load unpacked extension...`, and choose the folder      `handsfree/development/`.

The extension will be assigned a random ID, which you must copy into the file website/input.js as the value of the "extensionId" variable.

When the development version of the extension is activated, it will open a window at `https://127.0.0.1:8000/input.html`, and Chrome will tell you the SSL certificate isn't trusted, you're in danger, etc. Click "Advanced" and proceed anyway. Then open the Chrome Dev Tools and go to the Security tab. Click "View Certificate," then go to the Details tab in the window which pops up and select "Copy to File." Keep all default options picked in the export wizard; the file name can be anything.

Finally, in Chrome go to Settings > Advanced Settings > Manage certificates... and import the certificate file to Trusted Root Certificate Authorities. Now the page will be accepted as valid HTTPS, and there will be no warning from Chrome.


Production
----------

There are a few differences in the code between the development version of the extension and the production version:

* The value of extensionId in website/input.js
* DEV_MODE switch in control.js and background.js
* "https://localhost:8000/*" can be removed from "externally connectable" in manifest.json

The repository owner handles the updating of the production files after changes to dev.