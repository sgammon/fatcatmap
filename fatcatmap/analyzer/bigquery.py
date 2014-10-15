import httplib2
import pprint
import sys
import os
import time

from apiclient.discovery import build
from apiclient.errors import HttpError

from oauth2client.client import SignedJwtAssertionCredentials
from oauth2client.client import flow_from_clientsecrets


email = '489276160057-sbq5ndobke8inbf1o4qejvcg60ffikg7@developer.gserviceaccount.com'
projectId = '489276160057'

class BQResponse(object):
  ''' simple wrapper around bq async jobs response'''
  def __init__(self,response):
    self.response = response
    for k,v in response['configuration']['destinationTable'].iteritems():
      # sets projectId,tableId,datasetId from jobs resource
      setattr(self,k,v)
    self.tablepath = "{d}.{t}".format(d=self.datasetId,t=self.tableId)
    self.jobId = self.response['jobReference']['jobId']




class BQ(object):

  def __init__(self):
    f = file('conf/credentials/fatcatmap-8c0dc3495dba.p12', 'rb')
    key = f.read()
    f.close()
    credentials = SignedJwtAssertionCredentials(email,key,scope='https://www.googleapis.com/auth/bigquery')

    http = httplib2.Http()
    http = credentials.authorize(http)

    self.service = build('bigquery', 'v2', http=http)
    self.jobs = self.service.jobs()


  def execute(self,query):

    '''Executes the given query and returns a :py:class`BQResponse` object'''

    jobData = {
      'configuration': {
        'query': {
          'query': query,
        }
      }
    }
    response = self.jobs.insert(projectId=projectId,
                                         body=jobData).execute()
    return BQResponse(response)

  def load_file(self,filename):

    path = os.path.join(os.path.dirname(os.path.realpath(__file__)),filename)
    f = open(path,'r')
    data = f.read()
    f.close()
    return data

class RecipientStats(BQ):



  def step1(self):
    '''performs step 1 of recipent stats and returns when async bigquery job is finished
    '''
    sql = self.load_file('data/finance_categories/recipient_percentile.sql')
    print sql
    response = self.execute(sql)
    while True:
      job = self.jobs.get(projectId=projectId,jobId=response.jobId)
      if job['status']['state'] == "DONE":
        break
      else:
        time.sleep(2)

    return response


  def step2(self,source_table):
    sql = self.load_file('data/finance_categories/recipient_percentile_people.sql')
    sql = sql.format(source_table=source_table)
    response = self.execute(sql)
    return response

  def run(self):

    s1 = self.step1()

    s2 = self.step2(s1.tablepath)

    return s2





