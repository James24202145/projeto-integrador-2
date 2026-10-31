from flask import Blueprint, render_template

paginas_bp = Blueprint('paginas', __name__)


# Rota da página web (Front-end com Leaflet.js)
@paginas_bp.route('/')
def index():
    return render_template('index.html')
