> tree /f
C:.
│  index.html
│  main.js
│  README.md
│
├─data
│      cards.js
│
├─engine
│      actions.js
│      cardFactory.js
│      engine.js
│      gameState.js
│      zones.js
│
└─ui
        render.js




cd cardgame
python -m http.server
or
uv run -m http.server

http://localhost:8000