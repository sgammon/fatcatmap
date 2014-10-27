create table pac_to_politician_2012  as
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

from default.contribution_sums_2012

where contributor_ext_id != ''
    and recipient_ext_id != ''
    and (transaction_type = '24g' or transaction_type = '24k')
    and recipient_type = 'P'
    and contributor_type = 'C';





./presto.jar --catalog hive --server localhost:8090 --execute "select * from pac_to_politician" --output-format CSV_HEADER > ~/edges/pac_to_politician.csv
