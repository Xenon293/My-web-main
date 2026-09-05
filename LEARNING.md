# 1. Technology Stack

This is a JavaScript React application built with Vite. React creates reusable components, Vite builds the app, and plain CSS in `src/styles.css` and `src/enhancements.css` controls the visual design. No animation library is used.

# 2. Project Architecture

`index.html` → `src/main.jsx` → `src/App.jsx` → components and data.

`Nav.jsx` contains navigation and theme controls. `ProjectCard.jsx` renders projects from `data/projects.js`. `Reveal.jsx` is the shared scroll animation wrapper.

# 3. Important Language Concepts

This project uses imports/exports, JSX, function components, props, `useState`, `useEffect`, `useRef`, template strings, and array `map`.

# 4. How the Animation System Works

`Reveal.jsx` uses `IntersectionObserver` to detect viewport entry. It adds `is-visible`; CSS transitions opacity and a small upward transform. The `delay` prop creates a stagger. Reduced-motion users get visible content without transitions.

# 5. Scroll Animation Walkthrough

Project cards are wrapped in `Reveal` in `App.jsx`. The observer sees a card, sets state to visible, and CSS changes opacity from 0 to 1 and transform from 22px down to its natural position.

# 6. Theme System

`Nav.jsx` stores theme state and preference in `localStorage`, falling back to the system preference. An early script in `index.html` prevents most first-paint flashes. Dark colors are CSS variables under `[data-theme=dark]`.

# 7. Contact Component

The contact section is composed in `App.jsx`. It has a real mail link and GitHub link. The theme control is in navigation because it changes the whole document.

# 8. How To Modify Things Myself

Change reveal speed in `src/enhancements.css`. Change projects in `src/data/projects.js`. Update the email by editing both the `mailto:` link and visible address in `App.jsx`. Dark colors are the variables in `[data-theme=dark]`.

# 9. Common Mistakes

If a project does not appear, check its object shape and `map` data. If an animated element stays hidden, check that it is inside `Reveal`. Keep valid URLs and preserve image alt text.

# 10. Try It Yourself

Level 1: change reveal duration. Level 2: try another easing curve. Level 3: add a project object. Level 4: animate a focus item. Level 5: build a reusable badge component.

# 11. What Should I Learn Next?

Study React props and state, the DOM and IntersectionObserver, CSS custom properties, accessible buttons, responsive CSS, and Git workflows.
