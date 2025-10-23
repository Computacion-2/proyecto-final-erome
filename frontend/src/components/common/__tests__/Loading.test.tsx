import React from 'react';
import { render, screen } from '@testing-library/react';
import Loading from '../Loading';

describe('Loading Component', () => {
  it('renders with default message', () => {
    render(<Loading />);
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<Loading message='Cargando datos...' />);
    expect(screen.getByText('Cargando datos...')).toBeInTheDocument();
  });

  it('renders with custom size', () => {
    render(<Loading size={60} />);
    // The size prop affects the CircularProgress component
    // We can test that the component renders without errors
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });
});
