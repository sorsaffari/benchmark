package grakn.benchmark.profiler.generator.pick;


import java.util.Iterator;
import java.util.Locale;
import java.util.Objects;
import java.util.Random;
import java.util.function.Consumer;
import java.util.stream.Stream;

/**
 * adapted from https://stackoverflow.com/questions/41107/how-to-generate-a-random-alpha-numeric-string
 */
public class RandomStringIterator implements Iterator<String> {

    private static final String UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String LOWER = UPPER.toLowerCase(Locale.ROOT);
    private static final String DIGITS = "0123456789";
    private static final String ALPHANUM = UPPER + LOWER + DIGITS;

    private final Random random;
    private final char[] symbols;
    private final char[] buf;

    @Override
    public boolean hasNext() {
        return true;
    }

    /**
     * Generate a random string.
     */
    public String next() {
        for (int idx = 0; idx < buf.length; ++idx)
            buf[idx] = symbols[random.nextInt(symbols.length)];
        return new String(buf);
    }

    @Override
    public void remove() {

    }

    @Override
    public void forEachRemaining(Consumer action) {
        while (hasNext()) {
            action.accept(next());
        }
    }


    private RandomStringIterator(Random random, int stringLength, String symbols) {
        if (stringLength < 1) throw new IllegalArgumentException();
        if (symbols.length() < 2) throw new IllegalArgumentException();
        this.random = Objects.requireNonNull(random);
        this.symbols = symbols.toCharArray();
        this.buf = new char[stringLength];
    }

    /**
     * Create an alphanumeric string generator.
     */
    public RandomStringIterator(Random random, int stringLength) {
        this(random, stringLength, ALPHANUM);
    }

}