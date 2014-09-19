
file = open('feccategories.csv')
lines = file.read()
lines = lines.split('\n')
{l[0]:l[1] for l in [line.split(',') for line in lines]}