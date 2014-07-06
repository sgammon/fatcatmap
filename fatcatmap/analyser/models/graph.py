from bulbs.model import Node, Relationship
from bulbs.property import String, Integer, DateTime
import datetime
from bulbs.rexster import Graph
from bulbs.config import Config
import MySQLdb
import MySQLdb.cursors



import time


class Person(Node):
  element_type = "person"
  id = Integer(unique=True)
  firstname = String(nullable=True)
  middlename = String(nullable=True)
  birthday = DateTime(nullable=True) # issue with old dates
  #birthday = String(nullable=True)
  nickname = String(nullable=True)
  lastname = String(nullable=True)
  namemod = String(nullable=True)
  lastnameenc = String(nullable=True)

  gender = String(nullable=True)
  religion = String(nullable=True)
  osid = String(nullable=True)
  bioguideid = String(nullable=True)

class Injest(object):
  batch = 50
  def __init__(self):
    config = Config("http://127.0.0.1:8182/graphs/fcm", username="admin", password="admin")
    self.g = Graph(config)
    self.g.add_proxy("people",Person)
    self.db=MySQLdb.connect(host="localhost",user="root",charset='utf8',
                            db="govtrack",cursorclass=MySQLdb.cursors.DictCursor)
  def people(self):
    c = self.db.cursor()
    c.execute("select * from people")
    fields = Person._db_map.values()
    for row in c.fetchall():
      try:
        row['birthday'] = row['birthday'].strftime('%m/%d/%Y')
        print row['birthday']
      except:
        print "couldn't parse date "
      print row
      #self.g.vertices.create(_data=row)
      data = {k:v for k,v in row.iteritems() if k in fields}

      p = self.g.people.create(**data)

#i = Injest()
#i.people()