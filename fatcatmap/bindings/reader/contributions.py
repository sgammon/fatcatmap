from csv import CSVReader
from scipy.stats import percentileofscore
c = CSVReader()
c.open()
a = [c for c in c.get_lines()]

amounts = [row[7] for row in a]
amount_percentiles = [percentileofscore(amounts,i) for i in amounts]

counts = [row[6] for row in a]
