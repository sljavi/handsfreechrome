Hands Free For Chrome
=========

Chrome extension for hands-free exploration of the world wide web!


Development
-----------

This extension uses an external web page to get around some microphone restrictions Chrome has. This means you need to set up a local server in order to work on certain parts of the code. A python file is included which set up a local HTTPS server. You can start it up with the command

     python website/local-server.py

Once the server is running, open Chrome, go to settings > extensions > Load unpacked extensions, and choose the folder "handsfree/development/".

This will show a random ID, which you must copy into the file website/input.js as the value of the "extensionId" variable.


Production
----------

There are a few differences between the code for the production version of the extension and the development version:

* The value of extensionId in website/input.js
* The value of input_url in control-min.js
* The value of input_url in background-min.js
* "https://127.0.0.1:8000/*" can be removed from "externally connectable" in manifest.json