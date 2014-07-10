

from mogwai.connection import setup
from mogwai.models import Vertex, Edge
from mogwai import properties

setup('localhost',graph_name="fcm",username="admin",password="admin")


class Person1(Vertex):
  id = properties.Integer()
  firstname = properties.String(required=False)
  middlename = properties.String(required=False)
  #birthday = properties.DateTimeNaive(strict=False,required=False)
  birthday = properties.String()
  nickname = properties.String(required=False)
  lastname = properties.String(required=False)
  namemod = properties.String(required=False)
  lastnameenc = properties.String(required=False)

  gender = properties.String(required=False)
  religion = properties.String(required=False)
  osid = properties.String(required=False)
  bioguideid = properties.String(required=False)

class Person(Vertex):
  element_type = 'person'
  #id = properties.Integer()
  firstname = properties.String(required=False, max_length=1024)
  middlename = properties.String(required=False, max_length=1024)
  #birthday = properties.DateTimeNaive(strict=False,required=False)
  birthday = properties.String(required=False, max_length=1024)
