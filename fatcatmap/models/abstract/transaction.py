# -*- coding: utf-8 -*-

'''

    fcm: transaction models

'''

# event models
from .event import Event


class Transaction(Event):

  '''  '''


class CurrencyTransaction(Transaction):

  '''  '''

  amount = float, {'indexed': True}


class Contract(Transaction):

  '''  '''
