SELECT
           recipient_type,
           contributor_type,
           transaction_type,

           committee_ext_id,
           recipient_ext_id,
           contributor_ext_id,

           Count(amount)      AS count,
           Round(Sum(amount)) AS amount

    FROM   raw.contributions_new
    where recipient_ext_id != '' and contributor_ext_id != '' and transaction_namespace contains 'fec'

    GROUP EACH BY
              recipient_ext_id,
              contributor_ext_id,
              recipient_type,
              committee_ext_id,
              contributor_type,
              transaction_type
