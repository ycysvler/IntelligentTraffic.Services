# -*- coding: UTF-8 -*-
import logging
from flask import Flask
from flask_restful import reqparse, abort, Api, Resource
from vehile import Vehile

app = Flask(__name__)
api = Api(app)
parser = reqparse.RequestParser()
parser.add_argument('image')

v = Vehile()

v.init()

class Calculator(Resource):
    def get(self):
        args = parser.parse_args()
        return v.getItems(args['image'])

api.add_resource(Calculator, '/calculator')

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=7777,debug=False)
