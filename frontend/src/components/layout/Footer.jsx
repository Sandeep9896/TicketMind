import React from 'react';

const Footer = ({ accentBg }) => {
  return (
    <footer className="border-t border-[var(--tm-border)] bg-[var(--tm-footer)] text-[var(--tm-text-muted)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-sm">© {new Date().getFullYear()} TicketMind. All rights reserved.</div>

        <div className="flex items-center gap-4 text-sm">
          <a href="/terms" className="hover:text-[var(--tm-text)]">Terms</a>
          <a href="/privacy" className="hover:text-[var(--tm-text)]">Privacy</a>
          <a href="https://github.com/" target="_blank" rel="noreferrer" className={`px-2 py-1 rounded ${accentBg} text-white text-xs`}>GitHub</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
