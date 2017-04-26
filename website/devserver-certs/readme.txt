The python server uses server.pem for its ssl.

You must add server.crt, which is the self-signed certificate file tied to that .pem, to Chrome's list of trusted certificates so as to allow HTTPS on localhost. Do this by going to Advanced Settings -> Manage Certificates, then importing the .crt and adding it to "Trusted Root Certification Authorities".

You must then restart chrome entirely, not just refresh the page.

All files here were generated with OpenSSL at the command line.