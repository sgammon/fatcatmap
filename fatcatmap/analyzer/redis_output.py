import redis



class Output(object):

  r = redis.StrictRedis(db=9)

  def __init__(self):

