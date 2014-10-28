def _type(field):

  '''
      Returns the Hive field type given a field `name`
      :param field:
      :return:
  '''

  field = field.lower()
  if field in ('amount',):
    return "Float"
  elif field in ('id', 'ref', 'cycle'):
    return "Int"
  else:
    return "String"

def csv_to_hive(line,name):

  '''  Turns a CSV header line into a hive-compatible csv schema
      :param line: csv header line
      :return:
  '''

  header = line.split(",")

  fields = ", ".join(["%s %s" % (field, _type(field)) for field in header])

  sql = """ CREATE TABLE {name}({fields})
            row format delimited fields terminated by ','
            STORED AS TEXTFILE;

            CREATE TABLE {name_orc}({fields})
            STORED AS orc tblproperties ("orc.compress"="SNAPPY");
            """.format(name=name,fields=fields)

  return sql
