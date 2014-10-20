#!/bin/bash

echo "Generating new dataset from scratch..."

echo "--Cleaning target and inserting fixtures..."
fcm migrate --clean --fixtures

echo "--Loading current Legislators...";
fcm --verbose load legislators:Legislators yaml --files legislators-current.yaml


echo "--Loading historical Legislators...";
fcm --verbose load legislators:Legislators yaml --files legislators-historical.yaml

echo "--Loading current committees...";
fcm --verbose load committees:Committees yaml --files committees-current.yaml

echo "--Loading historical committees...";
fcm --verbose load committees:Committees yaml --files committees-historical.yaml