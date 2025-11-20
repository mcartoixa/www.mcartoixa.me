#!/bin/bash

set -e

_TASK='build'
_PARAM=${1}
_VERBOSITY=notice

usage() {
  cat <<EOF
Usage: ${0} [TASK] OR [OPTION]

  TASK
    analyze         Analyzes the code
    build           Builds a package
    clean           Removes any packages
    compile         Compiles a package
    package         Makes a package
    rebuild         Rebuilds a package
    release         Releases a new package
    test            Tests the project

  OPTION
    --help, -h      Shows this help
EOF
}

run() {
  npm install --loglevel ${_VERBOSITY}
  if [ $? -ne 0 ]; then
    fail
  fi

  npm run-script build:${_TARGET} --loglevel ${_VERBOSITY}
  if [ $? -ne 0 ]; then
    fail
  fi

  exit 0
}

error() {
  _ERROR_MESSAGE=${1}

  echo
  echo -e "\033[0;31m${_ERROR_MESSAGE}\033[0m"

  fail
}

fail() {
  _BACKGROUND_RED='\033[1;41m'
  _BACKGROUND_TRANSPARENT='\033[0m'

  echo
  echo -e "${_BACKGROUND_RED}                                                       ${_BACKGROUND_TRANSPARENT}"
  echo -e "${_BACKGROUND_RED}                    The task failed                    ${_BACKGROUND_TRANSPARENT}"
  echo -e "${_BACKGROUND_RED}                                                       ${_BACKGROUND_TRANSPARENT}"

  exit 1
}

[ "${PARAM}" = '' ] && run

case ${PARAM} in
  analyze|build|compile|package|rebuild|release|test) _TASK=${_PARAM}; run ;;
  clean) _TASK=clean; rm -rf ./.tmp/; rm -rf ./node_modules/; rm -rf ./tmp/ ;;
  -l|--log) _VERBOSITY=verbose ;;
  -h|--help) usage ;;
  *) usage; error 'Unknown task or option' ;;
esac
