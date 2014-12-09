create table contributions_ranked  as
SELECT

   recipient_type,
   contributor_type,
   transaction_type,

   committee_ext_id,
   recipient_ext_id,
   contributor_ext_id,

    amount,
    count,
    PERCENT_RANK() OVER (order by amount ASC) amount_rank,
    PERCENT_RANK() OVER (order by count ASC) count_rank

from contributions_orc

where contributor_ext_id != ''
    and recipient_ext_id != ''
    #and transaction_type = '15';