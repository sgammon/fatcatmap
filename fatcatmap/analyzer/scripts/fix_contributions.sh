#!/bin/bash


# replace \" with "" so that bigquery can read the CSV
zcat contributions.all.csv.gz | sed 's/\\"/""/g' | pigz -6 > contributions_fixed.csv.gz
