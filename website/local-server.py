'''
HTTPS server for local development on Hands Free.

Allows dev version of Chrome extension to open "https://localhost:8000/input.html" for voice input.
The SSL certificate in devserver-certs must be added to Chrome before it will allow HTTPS. See README.md.

Works with both Python 2 and 3.
'''

import sys
import ssl

majorVersion = sys.version_info[0]

# Http server modules were reorganized between python2 and python3.
if majorVersion == 2:
	import BaseHTTPServer, SimpleHTTPServer
	httpd = BaseHTTPServer.HTTPServer(('localhost', 8000), SimpleHTTPServer.SimpleHTTPRequestHandler)
	httpd.socket = ssl.wrap_socket(
		httpd.socket,
		certfile='devserver-certs/server.pem',
		server_side=True)
	print("Listening at https://localhost:8000/ . . .")
	httpd.serve_forever()
elif majorVersion == 3:
	from http.server import HTTPServer, SimpleHTTPRequestHandler
	server_address = ('', 8000)
	httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)
	httpd.socket = ssl.wrap_socket(
		httpd.socket,
		certfile='devserver-certs/server.pem',
		server_side=True)
	print("Listening at https://localhost:8000/ . . .", flush=True)
	httpd.serve_forever()
else:
	print('Welcome, traveler. You seem to be from the future, \
		or possibly the very distant past.')

