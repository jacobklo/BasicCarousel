/*
 * Jacob Lo : jacoblo@jacoblo.net
 */
import static org.junit.Assert.*;
import org.junit.Test;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;

//package com.WilliamsSonomainc

public class MinMaxSchedulingProblem {
  
  @Test
  public void testEmpty() {
    ArrayList<ZipCodeRange> zipCodes = new ArrayList<>();
    ArrayList<ZipCodeRange> result = calcMinNumRange(zipCodes);
    assertTrue(result != null);
    assertTrue(result.size() == 0);
  }
  
  @Test
  public void testaddOne() {
    ArrayList<ZipCodeRange> zipCodes = new ArrayList<>();
    zipCodes.add( new ZipCodeRange ( 100, 200 ) );
    ArrayList<ZipCodeRange> result = calcMinNumRange(zipCodes);
    assertTrue(result != null);
    assertTrue(result.size() == 1);
    assertTrue(result.get(0).getMinNumber() == 100);
    assertTrue(result.get(0).getMaxNumber() == 200);
  }
  
  @Test
  public void testNegative() {
    ArrayList<ZipCodeRange> zipCodes = new ArrayList<>();
    try {
      zipCodes.add( new ZipCodeRange ( -100, -200 ) );
    }
    catch(IllegalArgumentException iae) {
      // correctly catch not a zip code
      assertTrue(true);
    }
    assertTrue(zipCodes.size() == 0 ); 
  }
  
  @Test
  public void testNumberEqual() {
    ArrayList<ZipCodeRange> zipCodes = new ArrayList<>();
    zipCodes.add( new ZipCodeRange ( 94133, 94133 ) );
    ArrayList<ZipCodeRange> result = calcMinNumRange(zipCodes);
    assertTrue(result != null);
    assertTrue(result.size() == 1);
    assertTrue(result.get(0).getMinNumber() == 94133);
    assertTrue(result.get(0).getMaxNumber() == 94133);
    
  }
  
  @Test
  public void testNotInRange() {
    ArrayList<ZipCodeRange> zipCodes = new ArrayList<>();
    zipCodes.add( new ZipCodeRange ( 5, 9 ) );
    zipCodes.add( new ZipCodeRange ( 10, 100 ) );
    zipCodes.add( new ZipCodeRange ( 1, 3 ) );
    zipCodes.add( new ZipCodeRange ( 200, 300 ) );
    zipCodes.add( new ZipCodeRange ( 700, 800 ) );
    ArrayList<ZipCodeRange> result = calcMinNumRange(zipCodes);
    assertTrue(result != null);
    assertTrue(result.size() == 5);
    assertTrue(result.toString().equals("[[ 1, 3 ], [ 5, 9 ], [ 10, 100 ], [ 200, 300 ], [ 700, 800 ]]"));
  }
  
  @Test
  public void testInRange() {
    ArrayList<ZipCodeRange> zipCodes = new ArrayList<>();
    zipCodes.add( new ZipCodeRange ( 100, 200 ) );
    zipCodes.add( new ZipCodeRange ( 150, 1000 ) );
    zipCodes.add( new ZipCodeRange ( 1, 3 ) );
    zipCodes.add( new ZipCodeRange ( 100, 300 ) );
    zipCodes.add( new ZipCodeRange ( 700, 800 ) );
    ArrayList<ZipCodeRange> result = calcMinNumRange(zipCodes);
    System.out.println(result);
    assertTrue(result != null);
    assertTrue(result.size() == 2);
    assertTrue(result.toString().equals("[[ 1, 3 ], [ 100, 1000 ]]"));
  }
  
  
  /*
   * This method compare input collections of different ranges of number
   * @Return: an optimized version of lists of ranges, by removing overlapping
   * @Runtime: Time Complexity : O ( n log n )
   * Binary sort takes O ( n log n ) time.
   * Compare each record takes another O ( n ) time. Since we sort the array, there is no need to do backward compare. each record only need to read 1 time. So O ( n )
   * 
   * Space Complexity : O ( n ) we need new storage for the result optimized range.
   */
  public static <R extends NumberRange<Integer>> ArrayList<R> calcMinNumRange(ArrayList<R> collections) {
    // value check, avoid NullPointerException
    if ( collections == null || collections.isEmpty() ) return new ArrayList<>();
    
    // Sort the collections first, each range, from smallest min value to largest min value
    Collections.sort(collections, new Comparator<R>() {

      @Override
      public int compare(R o1, R o2) {
        return o1.compareTo(o2);
      }
    
    });
    
    
    ArrayList<R> result = new ArrayList<>();
    
    for ( R z : collections ) {
      if ( z.getMinNumber().doubleValue() > z.getMaxNumber().doubleValue() ) {
        continue;
      }
      // if result is empty, no compare is needed, add to result
      if ( result.isEmpty() ) {
        result.add(z);
      }
      
      else {
        // Last item in result for easy access, it is reference, so no memory overhead
        R lastResult = result.get( result.size() - 1);
        
        // If the current range has min value larger than the last record, then there is no overlap, add to result
        if ( NumberRange.compareNumber( z.getMinNumber(), lastResult.getMaxNumber()) > 0) {
          result.add(z);
        }
        // If the current range has min value smaller than the last record, overlap occur. Now need to check if the current record has larger max value the last record
        else if ( NumberRange.compareNumber( z.getMaxNumber() , lastResult.getMaxNumber() ) > 0) {
          lastResult.setMaxNumber( z.getMaxNumber() );
        }
      }
    }
    
    return result;
  }
  
  // Class specify for ZipCode
  private static class ZipCodeRange extends NumberRange<Integer> {

    public ZipCodeRange(Integer minNumber, Integer maxNumber) {
      super(minNumber, maxNumber);
      
      // Check if input is a zip code
      if ( minNumber < 0 || maxNumber < 0 || minNumber > 100000 || maxNumber > 100000 ) {
        throw new IllegalArgumentException("Not a zip code");
      }
    }
    
  }
  
  /*
   * Use generics class to extends the usability in the future
   */
  private static class NumberRange<N extends Number> implements Comparable<NumberRange<? extends Number>>{
    private N m_MinNumber;
    private N m_MaxNumber;
    
    protected NumberRange(N minNumber, N maxNumber) {
      setMinNumber(minNumber);
      setMaxNumber(maxNumber);
    }
    
    @Override
    public int compareTo(NumberRange<? extends Number> o) {
      if ( o == null ) return Integer.MAX_VALUE;
      // For sorting, if min value is the same, i want the smaller max value goes first
      if ( o.getMinNumber().equals(this.getMinNumber()) ) {
        return compareNumber(this.getMaxNumber(), o.getMaxNumber() ) * 1000;  // offset from compare between minZipCodes;
      }
      
      else {
        return compareNumber(this.getMinNumber(), o.getMinNumber() );
      }
    }
    
    @Override
    public String toString() {
      return "[ " + this.getMinNumber().toString() + ", " + this.getMaxNumber().toString() + " ]";
    }
    
    @SuppressWarnings("unchecked")
    @Override
    public boolean equals(Object o) {
      if (o == null || !(o instanceof NumberRange<?>) ) return false;
      return this.compareTo( (NumberRange<N>) o ) == 0;
    }
    
    public static <N extends Number> int compareNumber( N n1, N n2 ) {
      if ( n1 == null ) return Integer.MAX_VALUE;
      else if ( n2 == null ) return Integer.MIN_VALUE;
      return (int)( n1.doubleValue() - n2.doubleValue() );
    }
    
    public N getMinNumber() {
      return m_MinNumber;
    }
    public N getMaxNumber() {
      return m_MaxNumber;
    }
    public void setMinNumber(N newMinNumber) {
      this.m_MinNumber = newMinNumber;
    }
    public void setMaxNumber(N newMaxNumber) {
      this.m_MaxNumber = newMaxNumber;
    }

    
  }
}
