/*
 *  GRAKN.AI - THE KNOWLEDGE GRAPH
 *  Copyright (C) 2019 Grakn Labs Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

package grakn.benchmark.common.configuration;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import grakn.benchmark.common.configuration.parse.BenchmarkArguments;
import grakn.benchmark.common.configuration.parse.BenchmarkConfigurationFile;
import grakn.benchmark.common.configuration.parse.QueriesConfigurationFile;
import org.apache.commons.cli.CommandLine;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

/**
 * This class parses multiple yaml files into object and wraps them
 * making all the configurations needed for a benchmark execution
 * available through a single facade.
 */

public class BenchmarkConfiguration {

    private static final String DEFAULT_GRAKN_URI = "localhost:48555";

    private final boolean generateData;
    private final boolean loadSchema;
    private List<String> queries;
    private List<String> graqlSchema;
    private BenchmarkConfigurationFile benchmarkConfigFile;
    private String keyspace;
    private String graknUri;
    private String executionName;

    public BenchmarkConfiguration(CommandLine arguments) {
        Path configFilePath = getConfigFilePath(arguments);

        this.executionName = arguments.getOptionValue(BenchmarkArguments.EXECUTION_NAME_ARGUMENT);

        // Parse yaml file with generic configurations
        this.benchmarkConfigFile = parseConfigurationFile(configFilePath);

        // Parse yaml file containing all the queries for profiler (QueryExecutor)
        this.queries = parseQueriesFile(configFilePath).getQueries();

        // Parse yaml file containing Graql statements that define a schema, used by DataGenerator
        this.graqlSchema = parseGraqlSchema(configFilePath);

        // use given keyspace string if exists, otherwise use yaml file `name` tag
        this.keyspace = arguments.hasOption(BenchmarkArguments.KEYSPACE_ARGUMENT) ? arguments.getOptionValue(BenchmarkArguments.KEYSPACE_ARGUMENT) : this.dataGenerator();

        this.graknUri = (arguments.hasOption(BenchmarkArguments.GRAKN_URI)) ? arguments.getOptionValue(BenchmarkArguments.GRAKN_URI) : DEFAULT_GRAKN_URI;

        // If --no-data-generation is specified, don't generate any data (work with existing keyspace)
        this.generateData = !(arguments.hasOption(BenchmarkArguments.NO_DATA_GENERATION_ARGUMENT));

        // If --load-schema is specified, load a schema even if data generation is disabled
        this.loadSchema = arguments.hasOption(BenchmarkArguments.LOAD_SCHEMA_ARGUMENT);
    }

    public String graknUri() {
        return graknUri;
    }

    public String executionName() {
        return executionName;
    }

    public String configName() { return benchmarkConfigFile.getName(); }
    public String configDescription() { return benchmarkConfigFile.getDescription(); }

    public String dataGenerator() {
        return benchmarkConfigFile.getDataGenerator();
    }

    public String getKeyspace() {
        return keyspace;
    }

    public List<String> getGraqlSchema() {
        return graqlSchema;
    }

    public List<String> getQueries() {
        return queries;
    }

    public List<Integer> scalesToProfile() {
        return benchmarkConfigFile.scalesToProfile();
    }

    public boolean generateData() {
        return generateData;
    }

    public boolean loadSchema() { return loadSchema; }

    public int numQueryRepetitions() {
        return benchmarkConfigFile.getRepeatsPerQuery();
    }

    public boolean deleteInsertedConcepts() {
        return benchmarkConfigFile.deleteInsertedConcepts();
    }

    public boolean traceDeleteInsertedConcepts() {
        return benchmarkConfigFile.traceDeleteInsertedConcepts();
    }

    public int concurrentClients() {
        return benchmarkConfigFile.concurrentClients();
    }

    public boolean uniqueConcurrentKeyspaces() {
        return benchmarkConfigFile.uniqueConcurrentKeyspaces();
    }


    /**
     * Compute configuration file path, prepending path to working dir if relative path provided.
     *
     * @param arguments command line arguments
     * @return absolute path to configuration file
     */
    private Path getConfigFilePath(CommandLine arguments) {
        String configFileName = arguments.getOptionValue(BenchmarkArguments.CONFIG_ARGUMENT);
        Path configFilePath = Paths.get(configFileName);
        String workingDirectory = System.getProperty("working.dir");

        if (!configFilePath.isAbsolute() && workingDirectory != null) {
            configFilePath = Paths.get(workingDirectory).resolve(configFilePath);
        }
        if (!Files.exists(configFilePath)) {
            throw new ConfigurationException("The provided config file [" + configFilePath + "] does not exist.");
        }
        return configFilePath;
    }

    /**
     * Parse configuration file to object
     *
     * @param configFilePath absolute path to configuration file
     * @return Object representing yaml file
     */
    private BenchmarkConfigurationFile parseConfigurationFile(Path configFilePath) {
        ObjectMapper benchmarkConfigMapper = new ObjectMapper(new YAMLFactory());
        try {
            return benchmarkConfigMapper.readValue(configFilePath.toFile(), BenchmarkConfigurationFile.class);
        } catch (IOException e) {
            throw new ConfigurationException("Exception parsing Benchmark configuration file", e);
        }
    }

    /**
     * Parse queries file to object
     *
     * @param configFilePath absolute path to configuration file
     * @return Object that holds reference to array of queries
     */
    private QueriesConfigurationFile parseQueriesFile(Path configFilePath) {
        ObjectMapper mapper = new ObjectMapper(new YAMLFactory());
        Path queryFilePath = configFilePath.getParent().resolve(benchmarkConfigFile.getQueriesFilePath());
        try {
            return mapper.readValue(queryFilePath.toFile(), QueriesConfigurationFile.class);
        } catch (IOException e) {
            throw new ConfigurationException("Exception parsing queries file", e);
        }
    }

    /**
     * Parse Graql schema file into a list of Strings
     *
     * @param configFilePath absolute path to configuration file
     * @return List of string representing Graql schema declaration statements
     */
    private List<String> parseGraqlSchema(Path configFilePath) {
        Path schemaFilePath = configFilePath.getParent().resolve(benchmarkConfigFile.getRelativeSchemaFile());
        try {
            return Files.readAllLines(schemaFilePath, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new ConfigurationException("Exception parsing Graql schema file", e);
        }
    }
}
