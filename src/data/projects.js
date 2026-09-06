export const projects = [
  {
    number: '01',
    title: 'PyVault',
    description:
      'A local Python and Tkinter password manager designed around a small, clear security boundary: credentials stay encrypted on the user’s machine.',
    technologies: ['Python', 'Tkinter', 'Cryptography'],
    features: [
      'Master-password protection',
      'PBKDF2-HMAC-SHA256 key derivation',
      'Fernet authenticated encryption',
      'Local-only encrypted storage',
    ],
    github: 'https://github.com/Xenon293',
  },
  {
    number: '02',
    title: 'File Organizer',
    description:
      'A Python command-line utility that brings order to crowded folders by sorting files into categories based on their extensions.',
    technologies: ['Python', 'CLI', 'Argparse'],
    features: [
      'Automatic extension-based sorting',
      'Filename collision handling',
      '`--dry-run` preview mode',
      'Optional overwrite mode',
    ],
    github: 'https://github.com/Xenon293',
  },
];
