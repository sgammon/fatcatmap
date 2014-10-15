


create table contributions_csv(source String, recipient_type String,
                           committee_ext_id String, recipient_ext_id String,
                           contributor_ext_id String, transaction_type String,
                           t_count int, amount int)
row format delimited fields terminated by ','
STORED AS TEXTFILE;




LOAD DATA LOCAL INPATH '/Users/ian/Downloads/contributions_all.csv'
INTO TABLE contributions_csv
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ',';


create table contributions_orc(source String, recipient_type String,
                           committee_ext_id String, recipient_ext_id String,
                           contributor_ext_id String, transaction_type String,
                           t_count int, amount int)
 STORED AS orc tblproperties ("orc.compress"="SNAPPY");



INSERT into table contributions_orc SELECT * from contributions_orc_new;




INSERT OVERWRITE LOCAL DIRECTORY '/Users/ian/contributions'
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ','

