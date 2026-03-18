> tree /f
C:.
│  index.html
│  main.js
│  memo.txt
│  README.md
│  
├─data
│      cards.js
│      
├─engine
│      battle.js
│      cardFactory.js
│      effect.js
│      engine.js
│      gameState.js
│      move.js
│      phases.js
│      play.js
│      stateHelpers.js
│      turn.js
│      zones.js
│
└─ui
        render.js




cd cardgame
python -m http.server
or
uv run -m http.server

http://localhost:8000