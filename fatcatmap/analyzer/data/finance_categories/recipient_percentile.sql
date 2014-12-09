select
    recipient_type,
    recipient_ext_id,
    committee_ext_id,
    contributor_category,
    amount,
    count,
    PERCENT_RANK() OVER (PARTITION BY contributor_category order by amount ASC) amount_category_rank,
    PERCENT_RANK() OVER (order by amount ASC) amount_rank,
    PERCENT_RANK() OVER (PARTITION BY contributor_category order by count ASC) count_category_rank,
    PERCENT_RANK() OVER (order by count ASC) count_rank,
    source

  from (
    SELECT
           CASE
              WHEN transaction_namespace = 'urn:fec:transaction' THEN 'f' # return f for fec
              WHEN transaction_namespace = 'urn:nimsp:transaction' then 'n'
           END as source,
           recipient_type,
           committee_ext_id,
           recipient_ext_id,
           contributor_category,

           Count(amount)      AS count,
           Round(Sum(amount)) AS amount
    FROM   raw.contributions


    GROUP EACH BY recipient_ext_id,
              recipient_type,
              contributor_category,
              committee_ext_id,
              source
    );

