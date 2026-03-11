cardgame/

index.html

main.js

engine/
  gameState.js
  engine.js
  actions.js
  cardFactory.js

data/
  cards.json

ui/
  render.js




cd cardgame
python -m http.server
uv run -m http.server

http://localhost:8000