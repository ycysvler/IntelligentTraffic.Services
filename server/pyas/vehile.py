# -*- coding: UTF-8 -*-
import logging

class Vehile:
    items = []

    def init(self):
        print('vehile init')
        self.items = [{"vehicletype":"SUV","vehiclecolor":"red","vehiclemaker":"Jeep","vehicleyear":"2004款","vehiclemodel":"大切诺基","vehiclebrand":"Jeep","platetype":0,"platenumber":"黑A30293","platecolor":"red","platehasno":1,"vehiclezone":{"x":0,"y":0,"width":100, "height":100}},{"vehicletype":"SUV","vehiclecolor":"red","vehiclemaker":"Jeep","vehicleyear":"2004款","vehiclemodel":"大切诺基","vehiclebrand":"Jeep","platetype":0,"platenumber":"黑A30293","platecolor":"red","platehasno":1,"vehiclezone":{"x":0,"y":0,"width":100, "height":100}}]

    def getItems(self, image):
        return self.items

