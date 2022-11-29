
window.addEventListener('keydown', function(e) {
  if(
    (
      e.code === 'Space'
      || e.code === 'ArrowUp'
      || e.code === 'ArrowDown'
      || e.code === 'ArrowLeft'
      || e.code === 'ArrowRight'
    )
  ) {
    e.preventDefault();
  }
});

const playerA = new Player(
  new Control('KeyW', 'KeyS', 'KeyA', 'KeyD', 'Space')
);

const playerB = new Player(
  new Control('ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyO')
);

const gameLayout = document.getElementById('game');
const tanksGame = new TanksGame(gameLayout, 1200,800);
tanksGame.debug = true;
tanksGame.addPlayer(playerA);
