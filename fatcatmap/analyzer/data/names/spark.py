import csv

c = sc.textFile("/Users/ian/Downloads/organizations.csv")

c.cache()

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



names = c.map(make_kv).\
  reduceByKey(reduce_kv).map(map_to_csv)

names.saveAsTextFile("/Users/ian/vertexes/organizations.csv")