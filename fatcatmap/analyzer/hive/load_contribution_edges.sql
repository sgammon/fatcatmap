


create table contributions_csv(recipient_type String, contributor_type String,
                           committee_ext_id String, recipient_ext_id String,
                           contributor_ext_id String, transaction_type String,
                           organization_ext_id String,
                           count int, amount int)
row format delimited fields terminated by ','
STORED AS TEXTFILE;




LOAD DATA LOCAL INPATH '/Users/ian/Downloads/contributions_federal.csv'
INTO TABLE contributions_csv;


create table contributions_orc(recipient_type String, contributor_type String,
                           committee_ext_id String, recipient_ext_id String,
                           contributor_ext_id String, transaction_type String,
                           organization_ext_id String,
                           count int, amount int)
 STORED AS orc tblproperties ("orc.compress"="SNAPPY");



INSERT into table contributions_orc SELECT * from contributions_csv;




INSERT OVERWRITE LOCAL DIRECTORY '/Users/ian/contributions'
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ','



./presto.jar --catalog hive --server localhost:8090 --execute "select * from contributions_ranked" --output-format CSV_HEADER > contributions_federal_ranked.csv
