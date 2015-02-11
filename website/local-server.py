'''
HTTPS server for local development on Hands Free.

Allows dev version of Chrome extension to open "https://127.0.0.1:8000/input.html" for voice input.
Chrome will put a red X through the HTTPS protocol and say it's not trusted, but it works anyway.

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
		certfile='server.pem',
		server_side=True)
	print("Listening at https://127.0.0.1:8000/ . . .")
	httpd.serve_forever()
elif majorVersion == 3:
	from http.server import HTTPServer, SimpleHTTPRequestHandler
	server_address = ('', 8000)
	httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)

	httpd.socket = ssl.wrap_socket(
		httpd.socket,
		certfile='server.pem',
		server_side=True)
	print("Listening at https://127.0.0.1:8000/ . . .")
	httpd.serve_forever()
else:
	print('Welcome, traveler. You seem to be from the future, \
		or possibly the very distant past.')