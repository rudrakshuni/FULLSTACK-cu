import React from 'react';

/**
 * Card Component - Display individual card items
 * @param {Object} props
 * @param {string} props.id - Card ID
 * @param {string} props.title - Card title
 * @param {string} props.description - Card description
 * @param {string} props.status - Card status (active, inactive)
 * @returns {JSX.Element} Rendered card
 */
const Card = ({ id, title, description, status = 'active' }) => {
  return (
    <div className={`card card-${status}`} data-testid={`card-${id}`}>
      <h3 className="card-title">{title}</h3>
      <p className="card-description">{description}</p>
      <span className={`status-badge status-${status}`}>{status}</span>
    </div>
  );
};

/**
 * Dashboard Component - Complex component with multiple states
 * @param {Object} props
 * @param {boolean} props.isLoading - Loading state
 * @param {Error} props.error - Error object
 * @param {Array} props.data - Array of card data
 * @returns {JSX.Element} Rendered dashboard
 */
const Dashboard = ({ isLoading = false, error = null, data = [] }) => {
  if (isLoading) {
    return (
      <div className="dashboard-container" data-testid="dashboard">
        <div className="loading-spinner" data-testid="loading-state">
          Loading data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container" data-testid="dashboard">
        <div className="error-container" data-testid="error-state">
          <h2>Error</h2>
          <p>{error.message}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="dashboard-container" data-testid="dashboard">
        <div className="empty-state" data-testid="empty-state">
          <h2>No Data</h2>
          <p>There are no items to display at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container" data-testid="dashboard">
      <h1 className="dashboard-title">Dashboard</h1>
      <div className="cards-grid" data-testid="cards-grid">
        {data.map((item) => (
          <Card
            key={item.id}
            id={item.id}
            title={item.title}
            description={item.description}
            status={item.status}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
