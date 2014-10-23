SELECT
           recipient_type,
           contributor_type,
           committee_ext_id,
           recipient_ext_id,
           contributor_ext_id,
           transaction_type,

           Count(amount)      AS count,
           Round(Sum(amount)) AS amount

    FROM   contributions_federal
    where
        recipient_ext_id != '' and contributor_ext_id != ''
        and cycle >= 2012

    GROUP BY
           recipient_type,
           contributor_type,
           committee_ext_id,
           recipient_ext_id,
           contributor_ext_id,
           transaction_type