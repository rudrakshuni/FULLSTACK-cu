import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import CardList from './CardList';

describe('CardList Component - Snapshot Tests', () => {
  // Test 1: Snapshot of loading state
  it('should match snapshot for loading state', () => {
    const { container } = render(<CardList loading={true} />);
    expect(container.firstChild).toMatchSnapshot('loading-state');
  });

  // Test 2: Snapshot of error state
  it('should match snapshot for error state', () => {
    const { container } = render(<CardList error="Failed to load cards" />);
    expect(container.firstChild).toMatchSnapshot('error-state');
  });

  // Test 3: Snapshot of empty state
  it('should match snapshot for empty cards array', () => {
    const { container } = render(<CardList cards={[]} />);
    expect(container.firstChild).toMatchSnapshot('empty-state');
  });

  // Test 4: Snapshot with null cards
  it('should match snapshot when cards is null', () => {
    const { container } = render(<CardList cards={null} />);
    expect(container.firstChild).toMatchSnapshot('null-cards');
  });

  // Test 5: Snapshot of single card
  it('should match snapshot with single card', () => {
    const mockCards = [
      { title: 'Card 1', description: 'First card', status: 'active' }
    ];
    const { container } = render(<CardList cards={mockCards} />);
    expect(container.firstChild).toMatchSnapshot('single-card');
  });

  // Test 6: Snapshot of multiple cards
  it('should match snapshot with multiple cards', () => {
    const mockCards = [
      { title: 'Card 1', description: 'First card', status: 'active' },
      { title: 'Card 2', description: 'Second card', status: 'inactive' },
      { title: 'Card 3', description: 'Third card', status: 'active' }
    ];
    const { container } = render(<CardList cards={mockCards} />);
    expect(container.firstChild).toMatchSnapshot('multiple-cards');
  });

  // Test 7: Snapshot with mixed statuses
  it('should match snapshot with different card statuses', () => {
    const mockCards = [
      { title: 'Active Task', description: 'Currently working', status: 'active' },
      { title: 'Pending Task', description: 'Waiting approval', status: 'pending' },
      { title: 'Completed Task', description: 'Done', status: 'completed' }
    ];
    const { container } = render(<CardList cards={mockCards} />);
    expect(container.firstChild).toMatchSnapshot('mixed-statuses');
  });

  // Test 8: Verify snapshot consistency
  it('should consistently render same cards snapshot', () => {
    const mockCards = [
      { title: 'Test Card', description: 'Test description', status: 'active' }
    ];
    
    // First render
    const { container: container1 } = render(<CardList cards={mockCards} />);
    const snapshot1 = container1.innerHTML;

    // Second render with same data
    const { container: container2 } = render(<CardList cards={mockCards} />);
    const snapshot2 = container2.innerHTML;

    expect(snapshot1).toBe(snapshot2);
  });
});
