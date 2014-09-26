import MySQLdb as mdb
from __future__ import generators


def ResultIter(cursor, arraysize=1000):
    'An iterator that uses fetchmany to keep memory usage down'
    while True:
        results = cursor.fetchmany(arraysize)
        if not results:
            break
        for result in results:
            yield result

class SQLDriver(object):

  host = 'localhost'
  user = 'root'
  password = ''
  db = 'govtrack'

  def __init__(self):

    self.con = mdb.connect(self.host,self.user,self.password,self.db)


  def fetch(self,query=None):
    cursor = mdb.cursors.SSDictCursor(self.con)
    cursor.execute(query or "select * from percentile_people")
    return ResultIter(cursor)
