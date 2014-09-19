# -*- coding: utf-8 -*-

'''

  fcm: religion models

'''

# graph models
from .. import (Vertex,
                describe)

# canteen
from canteen import model

# abstract models
from ..abstract import (Role,
                        Content,
                        Faction,
                        TopicName,
                        FactionName,
                        Organization,
                        OrganizationName)

# descriptors
from ..descriptors.ext import ExternalID

# fcm models
from ..person import Person


## Globals
wikiprefix = 'https://wikipedia.org/wiki/'
christianity = model.VertexKey('Religion', 'christianity')
judaism = model.VertexKey('Religion', 'judaism')
islam = model.VertexKey('Religion', 'islam')
hinduism = model.VertexKey('Religion', 'hinduism')
jainism = model.VertexKey('Religion', 'jainism')
buddhism = model.VertexKey('Religion', 'buddhism')
lds = model.VertexKey('ReligiousSect', 'mormonism', parent=christianity)
baptist = model.VertexKey('ReligiousSect', 'baptists', parent=christianity)
lutheran = model.VertexKey('ReligiousSect', 'lutheranism', parent=christianity)
anglican = model.VertexKey('ReligiousSect', 'anglicanism', parent=christianity)
catholic = model.VertexKey('ReligiousSect', 'catholicism', parent=christianity)
adventist = model.VertexKey('ReligiousSect', 'adventist', parent=christianity)
unitarian = model.VertexKey('ReligiousSect', 'unitarianism', parent=christianity)
protestant = model.VertexKey('ReligiousSect', 'protestantism', parent=christianity)
disciples = model.VertexKey('ReligiousSect', 'disciples', parent=protestant)
evangelical = model.VertexKey('ReligiousSect', 'evangelicalism', parent=christianity)
holiness = model.VertexKey('ReligiousSect', 'holiness', parent=evangelical)
episcopalian = model.VertexKey('ReligiousSect', 'episcopalianism', parent=anglican)
presbyterian = model.VertexKey('ReligiousSect', 'presbyterianism', parent=christianity)
orthodox_judaism = model.VertexKey('ReligiousSect', 'orthodox', parent=judaism)
classical_judaism = model.VertexKey('ReligiousSect', 'classical', parent=judaism)


@describe(root=True, keyname=True, type=Faction, topic='/religion/religion')
class Religion(Vertex):

  '''  '''

  name = FactionName, {'indexed': True, 'embedded': True, 'required': True}

  @classmethod
  def fixture(cls):

    '''  '''

    for label, singular, plural, key, freebase, wikipedia in (
      ('Christianity', 'Christian', 'Christians', christianity, '/m/01lp8', 'Christianity'),
      ('Judaism', 'Jewish', 'Jews', judaism, '/m/03_gx', 'Judaism'),
      ('Islam', 'Muslim', 'Muslims', islam, '/m/0flw86', 'Islam'),
      ('Hinduism', 'Hindu', 'Hindus', hinduism, '/m/03j6c', 'Hinduism'),
      ('Jainism', 'Jain', 'Jaina', jainism, '/m/042s9', 'Jainism'),
      ('Buddhism', 'Buddist', 'Buddhists', buddhism, '/m/092bf5', 'Buddhism')):

      religion = cls(key=key)

      # naming - primary/secondary
      religion.name.primary, religion.name.secondary = (
        label, (plural,))

      # naming - formal/informal
      religion.name.formal, religion.name.informal = (
        label, (plural,))

      yield religion

      # external freebase + wikipedia IDs
      yield ExternalID.new(religion, 'freebase', 'mid', freebase)
      yield ExternalID.new(religion, 'wikipedia', 'en', wikiprefix + wikipedia)


@describe(parent=Religion, type=Faction)
class ReligiousSect(Religion):

  '''  '''

  religion = Religion, {'indexed': True, 'embedded': False}

  @classmethod
  def fixture(cls):

    '''  '''

    def make_sect(religion, label,
                  singular, plural,
                  freebase, wikipedia,
                  key=None, additional=None):

      '''  '''

      clean = lambda s: s.strip().lower()
      nice = lambda s: clean(s).capitalize()

      # resolve key
      if key is None:
        key = model.VertexKey(cls, clean(label), parent=religion)

      # make sect
      sect = cls(key=key, religion=religion)

      # naming - primary/secondary
      sect.name.primary, sect.name.secondary = (
        nice(label), tuple([nice(plural), nice(singular)] + [i for i in (additional or [])]))

      # naming - formal/informal
      sect.name.formal, sect.name.informal = (
        label.strip().capitalize(), (plural.strip().capitalize(),))

      return sect

    ## -- christianity -- ##
    for label, parent, additional, singular, plural, freebase, wikipedia in (
      ('Mormonism', christianity, ('Mormon Church', 'Latter Day Saints', 'Church of Latter Day Saints'), 'Mormon', 'Mormons', '/m/058x5', 'Latter_Day_Saint_movement'),
      ('Presbyterianism', christianity, ('Presbyterian Church',), 'Presbyterian', 'Presbyterians', '/m/0631_', 'Presbyterianism'),
      ('Unitarianism', christianity, ('Unitarian Church', 'Unitarian Universalist', 'Unitarian Universalist Church'), 'Unitarian', 'Unitarians', '/m/07w8f', 'Unitarian_Universalism'),
      ('Episcopalianism', anglican, ('Episcopalian Church',), 'Episcopalian', 'Episcopalians', '/m/02rsw', 'Episcopal_Church'),
      ('Catholicism', christianity, ('Roman Catholic', 'Catholic Church'), 'Catholic', 'Catholics', '/m/0c8wxp', 'Catholicism'),
      ('Disciples', protestant, ('Christian Church (Disciples of Christ)', 'First Christian Church (Disciples of Christ)', 'Disciples of Christ'), 'Disciple of Christ', 'Disciples of Christ', '/m/02dmx', 'Christian_Church_(Disciples_of_Christ)'),
      ('Holiness', evangelical, ('Church of the Nazarene', 'Nazarene'), 'Nazarene Christian', 'Nazarene Christians', '/m/01mv8w', 'Church_of_the_Nazarene'),
      ('Lutheranism', christianity, ('Lutheran Church',), 'Lutheran', 'Lutherans', '', 'Lutheranism'),
      ('Evangelicalism', christianity, ('Evangelical Christianity',), 'Evangelical', 'Evangelicals', '/m/02t7t', 'Evangelicalism'),
      ('Methodism', christianity, ('Methodist', 'Methodist Church'), 'Methodist', 'Methodists', '/m/051kv', 'Methodism'),
      ('Protestantism', christianity, ('Protestant Church',), 'Protestant', 'Protestants', '/m/05sfs', 'Protestantism'),
      ('Pentecostalism', christianity, ('Pentecostal Church',), 'Pentecostal', 'Pentecostals', '/m/05w5d', 'Pentecostalism'),
      ('Calvinism', christianity, ('Calvinist Church',), 'Calvinist', 'Calvinists', '/m/01t7j', 'Calvinism'),
      ('Baptists', christianity, ('Baptist Church',), 'Baptist', 'Baptists', '/m/019cr', 'Baptist'),
      ('Anglicanism', christianity, ('Anglican Church',), 'Anglican', 'Anglicans', '/m/0n2g', 'Anglicanism'),
      ('Anabaptists', christianity, ('Anabaptist Church',), 'Anabaptist', 'Anabaptists', '/m/01274', 'Anabaptists'),
      ('Adventist', christianity, ('Adventist Church',), 'Adventist', 'Adventists', '/m/025s83j', 'Adventism')):

      sect = yield make_sect(parent, label, singular, plural, freebase, wikipedia, additional=additional)
      yield ExternalID.new(sect, 'freebase', 'mid', freebase)
      yield ExternalID.new(sect, 'wikipedia', 'en', wikiprefix + wikipedia)

    ## -- judaism -- ##
    for label, additional, singular, plural, parent, freebase, wikipedia in (
      ('Orthodox', ('Orthodox Judaism',), 'Orthodox Jew', 'Orthodox Jews', judaism, '/m/05my9', 'Orthodox_Judaism'),
      ('Haredi', ('Haredi Judaism',), 'Haredi Jew', 'Haredi Jews', orthodox_judaism, '/m/0f2qf', 'Haredi_Judaism'),
      ('Hasidic', ('Hasidic Judaism',), 'Hasidic Jew', 'Hasidic Jews', orthodox_judaism, '/m/03r6w', 'Hasidic_Judaism'),
      ('Modern', ('Modern Orthodox Judaism',), 'Modern Orthodox Jew', 'Modern Orthodox Jews', orthodox_judaism, '/m/014j7r', 'Modern_Orthodox_Judaism'),
      ('Classical', ('Classical Reform Judaism', 'Reform Judaism', 'Reform'), 'Classical Reformed Jew', 'Classical Reformed Jews', judaism, '/m/06h98', 'Classical_Reform_Judaism'),
      ('Conservative', ('Conservative Judaism', 'Conservative Classical Judaism'), 'Conservative Classical Jew', 'Conservative Classical Jews', classical_judaism, '/m/01y7r', 'Conservative_Judaism'),
      ('Karaite', ('Karaite Judaism',), 'Karaite', 'Karaites', judaism, '/m/02zsjz', 'Karaite_Judaism'),
      ('Reconstructionist', ('Reconstructionist Judaism',), 'Reconstructionist Jew', 'Reconstructionist Jews', judaism, '/m/06h9q', 'Reconstructionist_Judaism'),
      ('Renewal', ('Jewish Renewal', 'Renewal Judaism'), 'Renewal Jew', 'Renewal Jews', judaism, '/m/01n15n', 'Jewish_Renewal'),
      ('Humanistic', ('Humanistic Judaism',), 'Humanistic Jew', 'Humanistic Jews', judaism, '/m/02cj5y', 'Humanistic_Judaism'),
      ('Haymanot', tuple(), 'Haymanot', 'Haymanot Jews', judaism, '/m/0jwz7r6', 'Haymanot')):

      # figure out inheritance
      key = None
      if label.lower() == 'orthodox':
        key = orthodox_judaism
      elif label.lower() == 'classical':
        key = classical_judaism

      yield make_sect(parent, label, singular, plural, freebase, wikipedia, key=key)
      yield ExternalID.new(sect, 'freebase', 'mid', freebase)
      yield ExternalID.new(sect, 'wikipedia', 'en', wikiprefix + wikipedia)

    # @TODO(sgammon): rest of the religious sects
    '''
    ## -- islam -- ##
    for label, singular, plural, parent, freebase, wikipedia in (
      ('Sunni', '', '', islam, '', ''),
      ('Shia', '', '', islam, '', ''),
      ('Sufism', '', '', islam, '', ''),
      ('Ahmadiyya', '', '', islam, '', ''),
      ('Ibadi', '', '', islam, '', ''),
      ('Quaranism', '', '', islam, '', '')):

      yield make_sect(parent, label, singular, plural, freebase, wikipedia)
      yield ExternalID.new(sect, 'freebase', 'mid', freebase)
      yield ExternalID.new(sect, 'wikipedia', 'en', wikiprefix + wikipedia)

    ## -- hinduism -- ##
    for label, singular, plural, parent, freebase, wikipedia in (
      ('Vaishnavism', '', '', hinduism, '', ''),
      ('Shaivism', '', '', hinduism, '', ''),
      ('Shaktism', '', '', hinduism, '', ''),
      ('Smartism', '', '', hinduism, '', '')):

      yield make_sect(parent, label, singular, plural, freebase, wikipedia)
      yield ExternalID.new(sect, 'freebase', 'mid', freebase)
      yield ExternalID.new(sect, 'wikipedia', 'en', wikiprefix + wikipedia)

    ## -- jainism -- ##
    for label, singular, plural, parent, freebase, wikipedia in (
      ('Digambara', '', '', jainism, '', ''),
      ('Śvētāmbara', '', '', jainism, '', '')):

      yield make_sect(parent, label, singular, plural, freebase, wikipedia)
      yield ExternalID.new(sect, 'freebase', 'mid', freebase)
      yield ExternalID.new(sect, 'wikipedia', 'en', wikiprefix + wikipedia)

    ## -- buddhism -- ##
    for label, singular, plural, parent, freebase, wikipedia in (
      ('Theravada', '', '', buddhism, '', ''),
      ('Mahayana', '', '', buddhism, '', ''),
      ('Tibetan', '', '', buddhism, '', '')):

      yield make_sect(parent, label, singular, plural, freebase, wikipedia)
      yield ExternalID.new(sect, 'freebase', 'mid', freebase)
      yield ExternalID.new(sect, 'wikipedia', 'en', wikiprefix + wikipedia)
    '''


@describe(parent=(Religion, ReligiousSect), type=Organization)
class ReligiousOrganization(Vertex):

  '''  '''

  name = OrganizationName, {'indexed': True, 'embedded': True}


@describe(parent=Person, type=Role)
class ReligiousOfficial(Vertex):

  '''  '''
