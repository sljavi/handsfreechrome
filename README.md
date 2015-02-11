Hands Free For Chrome
=========

Chrome extension for hands-free exploration of the world wide web!


Development
-----------

Hands Free uses an external web page to take voice input, thus circumventing the microphone restrictions on Chrome extensions. This means you need to run a local HTTPS server in order to work on certain portions of the code. A python script is included which does this for you. Assuming you have Python installed, you can start up the server with this command, which works with both Python 2 and Python 3:

     python website/local-server.py

Once the server is running, open Chrome, go to `Settings > Extensions > Load unpacked extension...`, and choose the folder      `handsfree/development/`.

The extension will be assigned a random ID, which you must copy into the file website/input.js as the value of the "extensionId" variable.

When the development version of the extension is activated, it will open a window at `https://127.0.0.1:8000/input.html`, and Chrome will tell you the SSL certificate isn't trusted, you're in danger, etc. Click "Advanced" and proceed anyway. Your safety is assured. Despite the red X through the HTTPS in the corner, the page will work fine.

Production
----------

There are a few differences in the code between the development version of the extension and the production version:

* The value of extensionId in website/input.js
* The value of input_url in control.js
* The value of input_url in background.js
* "https://127.0.0.1:8000/*" can be removed from "externally connectable" in manifest.json

However, the extension's primary author handles the updating of the production files from the dev files, so in theory you won't need to worry about it.
