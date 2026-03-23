import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from './Dashboard';

describe('Dashboard Component - Unit Tests', () => {
  describe('Loading State', () => {
    it('should render loading message when isLoading is true', () => {
      render(<Dashboard isLoading={true} />);
      
      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading data...');
    });

    it('should not render cards when loading', () => {
      render(<Dashboard isLoading={true} />);
      
      expect(screen.queryByTestId('cards-grid')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should render error message when error is provided', () => {
      const error = new Error('Failed to load data');
      render(<Dashboard error={error} />);
      
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load data')).toBeInTheDocument();
    });

    it('should render retry button in error state', () => {
      const error = new Error('Network error');
      render(<Dashboard error={error} />);
      
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('should not render cards when there is an error', () => {
      const error = new Error('Error occurred');
      render(<Dashboard error={error} />);
      
      expect(screen.queryByTestId('cards-grid')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should render empty state when data is empty array', () => {
      render(<Dashboard data={[]} />);
      
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No Data')).toBeInTheDocument();
      expect(screen.getByText('There are no items to display at the moment.')).toBeInTheDocument();
    });

    it('should render empty state when data is null', () => {
      render(<Dashboard data={null} />);
      
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    it('should render empty state when data is undefined', () => {
      render(<Dashboard data={undefined} />);
      
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    it('should not render cards grid in empty state', () => {
      render(<Dashboard data={[]} />);
      
      expect(screen.queryByTestId('cards-grid')).not.toBeInTheDocument();
    });
  });

  describe('Data Loaded State', () => {
    const mockData = [
      { id: '1', title: 'Item 1', description: 'Description 1', status: 'active' },
      { id: '2', title: 'Item 2', description: 'Description 2', status: 'inactive' },
      { id: '3', title: 'Item 3', description: 'Description 3', status: 'active' },
    ];

    it('should render dashboard title when data is loaded', () => {
      render(<Dashboard data={mockData} />);
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('should render cards grid when data is loaded', () => {
      render(<Dashboard data={mockData} />);
      
      expect(screen.getByTestId('cards-grid')).toBeInTheDocument();
    });

    it('should render all cards from data', () => {
      render(<Dashboard data={mockData} />);
      
      expect(screen.getByTestId('card-1')).toBeInTheDocument();
      expect(screen.getByTestId('card-2')).toBeInTheDocument();
      expect(screen.getByTestId('card-3')).toBeInTheDocument();
    });

    it('should render card with correct title and description', () => {
      render(<Dashboard data={mockData} />);
      
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Description 1')).toBeInTheDocument();
    });

    it('should render card status badge', () => {
      render(<Dashboard data={mockData} />);
      
      const activeCards = screen.getAllByText('active');
      const inactiveCards = screen.getAllByText('inactive');
      
      expect(activeCards.length).toBeGreaterThan(0);
      expect(inactiveCards.length).toBeGreaterThan(0);
    });

    it('should render correct number of cards', () => {
      render(<Dashboard data={mockData} />);
      
      const cards = screen.getAllByTestId(/^card-/);
      expect(cards).toHaveLength(3);
    });
  });

  describe('Props Handling', () => {
    it('should handle default props (no loading, no error, no data)', () => {
      render(<Dashboard />);
      
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    it('should prioritize loading state over other states', () => {
      const mockData = [{ id: '1', title: 'Item', description: 'Desc', status: 'active' }];
      render(<Dashboard isLoading={true} data={mockData} />);
      
      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
      expect(screen.queryByTestId('cards-grid')).not.toBeInTheDocument();
    });

    it('should prioritize error state over data state', () => {
      const mockData = [{ id: '1', title: 'Item', description: 'Desc', status: 'active' }];
      const error = new Error('Error');
      render(<Dashboard error={error} data={mockData} />);
      
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
      expect(screen.queryByTestId('cards-grid')).not.toBeInTheDocument();
    });
  });

  describe('Single Card Rendering', () => {
    const singleCardData = [
      { id: '1', title: 'Single Item', description: 'Single Description', status: 'active' },
    ];

    it('should render single card correctly', () => {
      render(<Dashboard data={singleCardData} />);
      
      expect(screen.getByTestId('card-1')).toBeInTheDocument();
      expect(screen.getByText('Single Item')).toBeInTheDocument();
      expect(screen.getByText('Single Description')).toBeInTheDocument();
    });
  });
});

describe('Dashboard Component - Snapshot Tests', () => {
  describe('Loading State Snapshot', () => {
    it('should match snapshot for loading state', () => {
      const { container } = render(<Dashboard isLoading={true} />);
      expect(container).toMatchSnapshot();
    });
  });

  describe('Error State Snapshot', () => {
    it('should match snapshot for error state', () => {
      const error = new Error('Failed to fetch data');
      const { container } = render(<Dashboard error={error} />);
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot for different error message', () => {
      const error = new Error('Server Error 500');
      const { container } = render(<Dashboard error={error} />);
      expect(container).toMatchSnapshot();
    });
  });

  describe('Empty State Snapshot', () => {
    it('should match snapshot for empty state', () => {
      const { container } = render(<Dashboard data={[]} />);
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot for null data', () => {
      const { container } = render(<Dashboard data={null} />);
      expect(container).toMatchSnapshot();
    });
  });

  describe('Data Loaded State Snapshot', () => {
    it('should match snapshot for data with active status', () => {
      const mockData = [
        { id: '1', title: 'Active Item', description: 'Active Description', status: 'active' },
      ];
      const { container } = render(<Dashboard data={mockData} />);
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot for data with inactive status', () => {
      const mockData = [
        { id: '1', title: 'Inactive Item', description: 'Inactive Description', status: 'inactive' },
      ];
      const { container } = render(<Dashboard data={mockData} />);
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot for multiple cards', () => {
      const mockData = [
        { id: '1', title: 'Item 1', description: 'Description 1', status: 'active' },
        { id: '2', title: 'Item 2', description: 'Description 2', status: 'inactive' },
        { id: '3', title: 'Item 3', description: 'Description 3', status: 'active' },
      ];
      const { container } = render(<Dashboard data={mockData} />);
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot for cards with mix of statuses', () => {
      const mockData = [
        { id: '1', title: 'Active', description: 'Desc 1', status: 'active' },
        { id: '2', title: 'Inactive', description: 'Desc 2', status: 'inactive' },
        { id: '3', title: 'Active', description: 'Desc 3', status: 'active' },
        { id: '4', title: 'Inactive', description: 'Desc 4', status: 'inactive' },
      ];
      const { container } = render(<Dashboard data={mockData} />);
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot for large data set', () => {
      const mockData = Array.from({ length: 10 }, (_, i) => ({
        id: String(i + 1),
        title: `Item ${i + 1}`,
        description: `Description ${i + 1}`,
        status: i % 2 === 0 ? 'active' : 'inactive',
      }));
      const { container } = render(<Dashboard data={mockData} />);
      expect(container).toMatchSnapshot();
    });
  });

  describe('Combined State Snapshots', () => {
    it('should match snapshot for loading state with default data', () => {
      const { container } = render(
        <Dashboard isLoading={true} data={[]} />
      );
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot for error state with data (error takes precedence)', () => {
      const mockData = [
        { id: '1', title: 'Item', description: 'Description', status: 'active' },
      ];
      const { container } = render(
        <Dashboard error={new Error('Error occurred')} data={mockData} />
      );
      expect(container).toMatchSnapshot();
    });
  });

  describe('Consistency Snapshots', () => {
    const consistentData = [
      { id: 'a', title: 'Product A', description: 'High quality', status: 'active' },
      { id: 'b', title: 'Product B', description: 'On sale', status: 'inactive' },
      { id: 'c', title: 'Product C', description: 'New arrival', status: 'active' },
    ];

    it('should render consistently with same data', () => {
      const { container: render1 } = render(<Dashboard data={consistentData} />);
      expect(render1).toMatchSnapshot();
    });

    it('should match snapshot for state consistency check', () => {
      const { container } = render(<Dashboard data={consistentData} />);
      expect(container).toMatchSnapshot();
    });
  });
});
