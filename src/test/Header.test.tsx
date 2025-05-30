// components/Header.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from '../component/Header';

describe('Header コンポーネント', () => {
  it('見出しテキストが表示される', () => {
    render(<Header />);
    
    // 見出しの内容を検証
    const heading = screen.getByRole('heading', { name: /人口推移と予測/i });
    expect(heading).toBeInTheDocument();
  });

  it('クラス名が適切に適用されている', () => {
    const { container } = render(<Header />);
    
    // classNameの検証
    const headerDiv = container.querySelector('.header');
    const textDiv = container.querySelector('.header__text');
    
    expect(headerDiv).toBeInTheDocument();
    expect(textDiv).toBeInTheDocument();
  });
});
