from api import create_app

if __name__ == '__main__':
    app = create_app()

    app.run(debug=True, host="0.0.0.0", ssl_context=('cert.pem', 'key.pem'))