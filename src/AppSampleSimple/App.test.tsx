import React from 'react';
import { render, screen } from '@testing-library/react';
import AppSampleSimple from './AppSampleSimple';

test('renders learn react link', () => {
  render(<AppSampleSimple />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
