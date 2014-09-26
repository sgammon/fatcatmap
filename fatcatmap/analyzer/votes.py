
from .sql_driver import SQLDriver
from textblob import TextBlob

class VoteFlow(SQLDriver):
    amdt = ['Amdt']

    def get_description(self,row):

        return TextBlob(row['description'])

    def parse(self,description):
        identifiers = set()
        data = {}

        tags = description.tags()
        if 'pass' in

        for idx,row in enumerate(tags):
            word, pos = row

            if "NNP" in pos:
                if tags[idx+1][1] == "CD" # if the POS of the next word is a cardinal number, this might be an entity
                    if any((amdt in word for amdt in self.amdt))
                    identifiers.add((word,tags[idx+1][0]))

