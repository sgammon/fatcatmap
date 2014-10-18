import csv



class SparkContributionBase(object):
  '''

  '''

  def make_kv(self):
    raise NotImplementedError()

  def reduce_kv(self):
    raise NotImplementedError()

  def map_to_csv(self):
    raise NotImplementedError()

  def open(self):
    '''
    Opens and sets up caching on the input file
    '''
    self.sparkfile = sc.textFile("/Users/ian/Downloads/organizations.csv")
    self.sparkfile.cache()

  def run(self):
    '''
    runs the spark program and saves the output to a csv
    '''
    names = c.map(make_kv).\
      reduceByKey(reduce_kv).map(map_to_csv)

    names.saveAsTextFile("/Users/ian/vertexes/organizations.csv")

class SparkContributorNames(SparkContributionBase):

  '''
  Class for extracting contributor names, ids, and categories from Influence Explorer contribution data
  '''

  def make_kv(l):
    ####  (contributor_ext_id/organization_ext_id, (num, contributor_name/organization_name, category) ###
    line = csv.reader([l]).next()
    return (line[0],(line[1], line[2], line[3]))

  def reduce_kv(kv1,kv2):
    #### (num, contributor_name) ####
    if int(kv1[0]) > int(kv2[0]):
      return kv1
    return kv2

  def map_to_csv(kv):
    return '"%s","%s","%s"' % (kv[0],kv[1][1],kv[1][2])




import csv

c = sc.textFile("/Users/ian/Downloads/politicians.csv")

c.cache()

def make_kv(l):
  ####  (contributor_ext_id/organization_ext_id, (num, contributor_name/organization_name, category, party) ###
  line = csv.reader([l]).next()
  return (line[0],(line[1], line[2], line[3],line[4]))



def reduce_kv(kv1,kv2):
  #### (num, contributor_name) ####
  if int(kv1[0]) > int(kv2[0]):

    return kv1
  return kv2

def map_to_csv(kv):
  return '"%s","%s","%s","%s"' % (kv[0],kv[1][1],kv[1][2],kv[1][3])



names = c.map(make_kv).\
  reduceByKey(reduce_kv).map(map_to_csv)

names.saveAsTextFile("/Users/ian/vertexes/politicians.csv")