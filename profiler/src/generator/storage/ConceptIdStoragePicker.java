package grakn.benchmark.profiler.generator.storage;

import grakn.core.concept.ConceptId;

import java.util.Iterator;
import java.util.Random;

public class ConceptIdStoragePicker implements Iterator<ConceptId> {

    private final Random rand;
    ConceptStorage conceptStorage;
    protected String typeLabel;

    public ConceptIdStoragePicker(Random rand, ConceptStorage conceptStorage, String typeLabel) {
        this.rand = rand;
        this.conceptStorage = conceptStorage;
        this.typeLabel = typeLabel;
    }

    @Override
    public boolean hasNext() {
        return this.conceptStorage.getConceptCount(this.typeLabel) > 0;
    }

    @Override
    public ConceptId next() {
        int conceptCount = this.conceptStorage.getConceptCount(this.typeLabel);
        int randomOffset = rand.nextInt(conceptCount);
        return conceptStorage.getConceptId(typeLabel, randomOffset);
    }

}