from pyspark.sql import HiveContext
from pyspark.sql import Row

fields = ('source',
  'recipient_type',
  'committee_ext_id',
  'recipient_ext_id',
  'contributor_ext_id',
  'transaction_type',
  'count',
  'amount')




def contributions(line):
    return { fields[idx]: val for idx,val in enumerate(line.split(','))}

def contributions_row(line):
    d = { fields[idx]: val for idx,val in enumerate(line.split(','))}
    return Row(**d)

c = sc.textFile("/Users/weisberger/Downloads/1.csv").cache()
rows = c.map(contributions_row).filter(lambda x: x.amount != 'amount')


sqlContext = HiveContext(sc)
context = sqlContext.inferSchema(rows)
context.registerAsTable("contributions")

query = """
select
    recipient_type,
    recipient_ext_id,
    committee_ext_id,
    contributor_ext_id,
    transaction_type,
    amount,
    count,
    PERCENTILE(amount) as amount_rank,
    PERCENTILE(count) as count_rank
from contributions
"""
sqlContext.hql(query).cache()


#  MASTER=local[8] bin/pyspark --driver-memory 8G

#  bin/pyspark --executor-memory 1G   --driver-memory 5G --master spark://ians-MacBook-Pro.local:7077
