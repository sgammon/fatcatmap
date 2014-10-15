
select
  organization_ext_id,
  count(organization_name) as num,
  organization_name

from raw.contributions_new

where organization_ext_id != '' and transaction_namespace contains 'fec'
and organization_name != ''
group each by
  organization_ext_id,
  organization_name
order by num desc