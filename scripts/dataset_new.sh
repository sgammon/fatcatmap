#!/bin/bash
# Downloads and loads legislator & committee data from open yaml sources.
#
# Assumes:
#   - current directory is fatcatmap project root
#   - bin/activate has already been run
#

RAW_SOURCE="https://github.com/unitedstates/congress-legislators.git"
RAW_TARGET="$(pwd)/.develop/data/congress-legislators"

VERTEX_CSV="~/vertexes"
EDGE_CSV="~/edges"

# Delete existing raw data & redownload.
clean_fetch_raw () {
  rm -rf $RAW_TARGET
  git clone $RAW_SOURCE $RAW_TARGET
}

# Check that the current working directory is (likely) the fcm project root.
if [[ ! $(pwd) == *fatcatmap ]] ; then
  echo "dataset_new.sh should be run from the fatcatmap project root directory."
  exit 1
fi

# Ensure that the virtualenv has been activated.
if ! fcm --help &> /dev/null ; then
  echo "fcm virtualenv must be activated before running dataset_new.sh."
  exit 2
fi

mkdir -p ".develop/data"

echo "Generating new dataset from scratch..."

# Download legislator & committee data. Do a git pull if possible to only fetch deltas.
echo "Downloading legislator and committee data..."

if [ -d $RAW_TARGET ] ; then
  pushd $RAW_TARGET
  (git pull origin master &> /dev/null && popd) || (popd ; clean_fetch_raw)
else
  clean_fetch_raw
fi

echo "--Cleaning target db and inserting fixtures..."
fcm migrate --clean --fixtures

echo "RAW TARGET $RAW_TARGET"
echo "--Loading current legislators..."
fcm load legislators:Legislators yaml --files $RAW_TARGET/legislators-current.yaml

echo "--Loading current committees..."
fcm load committees:Committees yaml --files $RAW_TARGET/committees-current.yaml


echo "--Loading current committee memberships..."
fcm load committees:CommitteeMembers yaml --files $RAW_TARGET/committee-membership-current.yaml

echo "--Loading PACs...";
fcm load sunlight:ContributorOrganization csv --files $VERTEX_CSV/organizations.csv/part-*

echo "--Loading PAC to Politician contributions...";
fcm load finance:Contribution csv --files  $EDGE_CSV/pac_to_politician.csv
