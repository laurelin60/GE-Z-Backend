from api import create_app
from sys import argv

app = create_app()

if __name__ == '__main__':
    if "use_ssl" in argv:
        app.run(debug=True, host="0.0.0.0",ssl_context=("ssl/certificate.crt", "ssl/private.key"))
    else:
        app.run(debug=True, host="0.0.0.0")