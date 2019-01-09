#!/usr/bin/env bash
#
# GRAKN.AI - THE KNOWLEDGE GRAPH
# Copyright (C) 2018 Grakn Labs Ltd
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.
#

set -e

# Benchmark global variables
JAVA_BIN=java
[[ $(readlink $0) ]] && path=$(readlink $0) || path=$0
BENCHMARK_HOME=$(cd "$(dirname "${path}")" && pwd -P)

SERVICE_LIB_CP="services/lib/*"

# ================================================
# common helper functions
# ================================================
exit_if_java_not_found() {
  which "${JAVA_BIN}" > /dev/null
  exit_code=$?

  if [[ $exit_code -ne 0 ]]; then
    echo "Java is not installed on this machine. Benchmark needs Java 1.8 in order to run."
    exit 1
  fi
}

# =============================================
# main routine
# =============================================

exit_code=0

pushd "$BENCHMARK_HOME" > /dev/null
exit_if_java_not_found

echo "Starting Elasticsearch..."
./external-dependencies/elasticsearch-6.3.2/./bin/elasticsearch -E path.logs=data/logs/elasticsearch/ -E path.data=data/data/elasticsearch/ &
sleep 10

echo "Starting Zipkin"
ES_HOSTS=http://localhost:9200 env ES_INDEX="benchmarking" java -jar ./external-dependencies/zipkin.jar &

echo "Starting Benchmark Runner"
CLASSPATH="${BENCHMARK_HOME}/${SERVICE_LIB_CP}"
java -cp "${CLASSPATH}" grakn.benchmark.runner.BenchmarkRunner $@

exit_code=$?

popd > /dev/null

exit $exit_code
