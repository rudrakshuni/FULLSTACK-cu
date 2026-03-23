import React from 'react';

// SNAPSHOT TEST EXAMPLE: Card Component
// Simple component that displays a single card
function Card({ title, description, status }) {
  return (
    <div className="card" data-testid={`card-${title}`}>
      <h3>{title}</h3>
      <p>{description}</p>
      <span className={`status ${status}`}>{status}</span>
    </div>
  );
}

// CardList Component - tests different states
export default function CardList({ loading, error, cards }) {
  // State 1: Loading
  if (loading) {
    return <div data-testid="loading-state">⏳ Loading cards...</div>;
  }

  // State 2: Error
  if (error) {
    return <div data-testid="error-state" style={{ color: 'red' }}>❌ Error: {error}</div>;
  }

  // State 3: Empty
  if (!cards || cards.length === 0) {
    return <div data-testid="empty-state">📭 No cards to display</div>;
  }

  // State 4: Data Loaded
  return (
    <div className="card-list" data-testid="card-list">
      {cards.map((card, idx) => (
        <Card key={idx} title={card.title} description={card.description} status={card.status} />
      ))}
    </div>
  );
}
