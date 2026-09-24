"""
Passenger WSGI / ASGI entry point for cPanel Python App deployment.
"""

import sys
import os

# Insert current working directory into sys.path
sys.path.insert(0, os.path.dirname(__file__))

from app.main import app as application
