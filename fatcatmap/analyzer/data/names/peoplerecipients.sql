#### Maps contributor_ext_id to  name ####

select
  recipient_ext_id,
  count(recipient_name) as num,
  recipient_name,
  recipient_category,
  recipient_party

from raw.contributions_new

where recipient_ext_id != '' and transaction_namespace contains 'fec'
and recipient_name != '' and recipient_type = 'P' and recipient_party != ''
group each by
  recipient_ext_id,
  recipient_name,
  recipient_category,
  recipient_party
order by num desc