create table contributions_ranked_by_type as
SELECT
    source,
    recipient_type,
    recipient_ext_id,
    contributor_ext_id,
    committee_ext_id,
    transaction_type,
    amount,
    t_count,
    PERCENT_RANK() OVER (PARTITION BY transaction_type order by amount ASC) amount_rank,
    PERCENT_RANK() OVER (PARTITION BY transaction_type order by t_count ASC) count_rank

from contributions_orc

where contributor_ext_id != '' and recipient_ext_id != ''