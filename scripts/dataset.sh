#!/bin/bash

echo "Generating new dataset from sandbox..."

echo "--Cleaning target and inserting fixtures..."
fcm migrate --clean --fixtures;

echo "--Adding Legislators..."
fcm migrate --source RedisAdapter --target RedisWarehouse --binding legacy --kinds Legislator

echo "--Adding Committees..."
fcm migrate --source RedisAdapter --target RedisWarehouse --binding legacy --kinds Committee

echo "--Adding Committee memberships..."
fcm migrate --source RedisAdapter --target RedisWarehouse --binding legacy --kinds Member

echo "Dataset generated. Saving to AOF..."
redis-cli -s /tmp/redis.sock CONFIG SET APPENDONLY yes > /dev/null 2> /dev/null

sleep 2

echo "Disabling AOF writes..."
redis-cli -s /tmp/redis.sock CONFIG SET APPENDONLY no > /dev/null 2> /dev/null

echo "Snapshotting AOF..."
cp -f ~/Workspace/Redis/appendonly.aof ./dataset.aof

echo "Compressing AOF snapshot..."
gzip -v --best ./dataset.aof
