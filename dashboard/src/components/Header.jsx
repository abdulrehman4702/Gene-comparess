import React from 'react';
import { Search } from 'lucide-react';

const Header = ({ searchTerm, setSearchTerm }) => {
  return (
    <header className="header">
      <div>
        <h1>Real-time Comparison System</h1>
        <p style={{color: 'var(--text-dim)'}}>Pharmacogenomic Interaction Dashboard</p>
      </div>
      <div className="search-container" style={{maxWidth: '400px'}}>
        <Search size={18} style={{position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)'}} />
        <input 
          type="text" 
          className="search-input" 
          placeholder="Search compounds..." 
          style={{paddingLeft: '40px'}}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </header>
  );
};

export default Header;
