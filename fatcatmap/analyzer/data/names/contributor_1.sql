#### Maps contributor_ext_id to  name ####

select
  contributor_ext_id,
  count(contributor_name) as num,
  contributor_name,
  contributor_category,

from raw.contributions_new

where contributor_ext_id != '' and transaction_namespace contains 'fec'
and contributor_name != ''
group each by
  contributor_ext_id,
  contributor_name,
  contributor_category
order by num desc