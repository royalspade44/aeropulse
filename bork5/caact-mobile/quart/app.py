from config import Config
from routes.audit import audit_bp
from routes.auth import auth_bp
from routes.profile import profile_bp
from routes.security import security_bp
from routes.tasks import tasks_bp
from routes.users import users_bp

from database import init_db
from quart import Quart, jsonify


def create_app() -> Quart:
    """
    Application factory that configures and returns the Quart ASGI app instance.
    Registers all blueprints, CORS headers, the startup hook, and global error handlers; called by run.py to obtain the app object.
    """
    app = Quart(__name__)
    app.config['SECRET_KEY'] = Config.SECRET_KEY
    app.config['DEBUG'] = Config.DEBUG

    # ------------------------------------------------------------------
    # CORS — handled manually via after_request so quart-cors is optional
    # ------------------------------------------------------------------

    @app.after_request
    async def add_cors(response):
        """
        Attach permissive CORS headers to every outgoing HTTP response.
        Called automatically by Quart's after_request hook after each route handler completes.
        """
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = (
            'Content-Type, Authorization'
        )
        response.headers['Access-Control-Allow-Methods'] = (
            'GET, POST, PATCH, DELETE, OPTIONS'
        )
        return response

    # Handle OPTIONS preflight for all routes
    @app.route('/', methods=['OPTIONS'])
    @app.route('/<path:path>', methods=['OPTIONS'])
    async def options_handler(path=''):
        """
        Respond to HTTP OPTIONS preflight requests for any URL in the application.
        Returns 204 No Content so browsers can proceed with their cross-origin requests without hitting auth middleware.
        """
        return '', 204

    # ------------------------------------------------------------------
    # Blueprints
    # ------------------------------------------------------------------

    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(audit_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(security_bp)

    # ------------------------------------------------------------------
    # Startup: create tables, then optionally seed debug accounts
    # ------------------------------------------------------------------

    @app.before_serving
    async def startup():
        """
        Initialise the database schema and optionally seed debug accounts before the server accepts requests.
        Called once by Quart's before_serving hook; triggers seed_accounts.seed_debug_accounts() when DEBUG=true.
        """
        await init_db(app)

        if Config.DEBUG:
            from seed_accounts import seed_debug_accounts

            await seed_debug_accounts()

    # ------------------------------------------------------------------
    # Global error handlers
    # ------------------------------------------------------------------

    @app.errorhandler(404)
    async def not_found(e):
        """
        Return a JSON 404 error body for any request that matches no registered route.
        Registered as a global Quart error handler for HTTP 404 errors.
        """
        return jsonify({'error': 'Not found'}), 404

    @app.errorhandler(405)
    async def method_not_allowed(e):
        """
        Return a JSON 405 error body when an HTTP method is not permitted on a route.
        Registered as a global Quart error handler for HTTP 405 errors.
        """
        return jsonify({'error': 'Method not allowed'}), 405

    @app.errorhandler(500)
    async def internal_error(e):
        """
        Return a JSON 500 error body for any unhandled server-side exception.
        Registered as a global Quart error handler for HTTP 500 errors.
        """
        return jsonify({'error': 'Internal server error'}), 500

    return app
