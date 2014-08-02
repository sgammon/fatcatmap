
select
  people.firstname as firstname,
  people.middlename as middlename,
  people.lastname as lastname,
  people.religion as religion,
  contributions.recipient_type as recipient_type,
  contributions.recipient_ext_id as recipient_id,

  categories.catname as contributor_category,
  categories.industry as contributor_industry,
  categories.sector as contributor_sector,

  ###### value fields #####
  INTEGER(contributions.amount) as amount,
  INTEGER(contributions.count) as count,
  #### ranking fields ####
  FLOAT(contributions.amount_category_rank) as amount_category_rank,
  FLOAT(contributions.amount_rank) as amount_rank,
  FLOAT(contributions.count_category_rank) as count_category_rank,
  FLOAT(contributions.count_rank) as count_rank,
  #### id fields ####
  contributions.committee_ext_id as committee_id,
  contributions.contributor_category as contributor_category_id,
  people.id as person_id

from [distributions.percentile] as contributions
        inner join [crp.categories] as categories
          on contributions.contributor_category=categories.catcode
        inner join [govtrack.people] as people
          on contributions.recipient_ext_id = people.osid
order by amount desc;