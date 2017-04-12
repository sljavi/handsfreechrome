The python server uses the .pem file for ssl.

You must add the associated self-signed .crt file, the certificate itself, to Chrome's list of trusted certificates. Do this by going to Advanced Settings -> Manage Certificates, then importing the .crt and adding it to Trusted Root Certification Authorities. You must then restart chrome entirely, not just refresh the page.

All files here generated with openssl at the command line.