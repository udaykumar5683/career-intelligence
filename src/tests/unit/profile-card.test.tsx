import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProfileCard } from '@/components/career/profile-card';

describe('ProfileCard Component', () => {
  const mockProfile = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    location: 'New York',
    summary: 'Expert developer',
    skills: ['React', 'TypeScript'],
    education: [],
    experience: [],
    certifications: [],
    languages: [],
    projects: [],
  };

  const mockRoles = [
    { role: 'Senior Dev', matchScore: 95, reason: 'Great skills', matchedSkills: ['React'], requiredSkills: ['TS'] }
  ];

  it('renders candidate name and contact info', () => {
    render(<ProfileCard profile={mockProfile} roles={mockRoles as any} />);
    
    expect(screen.getByText('John Doe')).toBeDefined();
    expect(screen.getByText('john@example.com')).toBeDefined();
    expect(screen.getByText('New York')).toBeDefined();
  });

  it('renders AI summary', () => {
    render(<ProfileCard profile={mockProfile} roles={mockRoles as any} />);
    
    expect(screen.getByText('Expert developer')).toBeDefined();
  });

  it('renders recommended roles', () => {
    render(<ProfileCard profile={mockProfile} roles={mockRoles as any} />);
    
    expect(screen.getByText('Senior Dev')).toBeDefined();
    expect(screen.getByText('95% Match')).toBeDefined();
  });
});
