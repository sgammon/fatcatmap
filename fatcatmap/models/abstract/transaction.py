# -*- coding: utf-8 -*-

'''

    fcm: transaction models

'''

# event models
from .event import describe, Event


@describe
class Transaction(Event):

  '''  '''


@describe
class CurrencyTransaction(Transaction):

  '''  '''

  amount = float, {'indexed': True}


@describe
class Contract(Transaction):

  '''  '''
