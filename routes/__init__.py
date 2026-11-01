from routes.paginas import paginas_bp
from routes.pontos import pontos_bp
from routes.ocorrencias import ocorrencias_bp
from routes.clima import clima_bp
from routes.geocodificacao import geocodificacao_bp


def registrar_rotas(app):
    """Registra todos os blueprints da aplicação."""
    app.register_blueprint(paginas_bp)
    app.register_blueprint(pontos_bp)
    app.register_blueprint(ocorrencias_bp)
    app.register_blueprint(clima_bp)
    app.register_blueprint(geocodificacao_bp)
