#!/bin/bash

# Cut latest release notes from CHANGELOG from STDIN

IS_STARTED=''
IS_PRINTED=''
IFS=''
while read -rs LINE ; do
  # is h2?
  if [ "${LINE:0:3}" = '## ' ]; then
    # is second h2?
    if [ -n "$IS_STARTED" ]; then
      break
    fi
    # no, it's first h2
    IS_STARTED=1
    continue
  fi

  # not started yet?
  if [ -z "$IS_STARTED" ]; then
    continue
  fi

  # here is wanted content line
  # nothing printed yet?
  if [ -z "$IS_PRINTED" ]; then
    # empty line
    if [ -z "$LINE" ]; then
      continue
    fi
    IS_PRINTED=1
  fi
  echo "$LINE"
done
