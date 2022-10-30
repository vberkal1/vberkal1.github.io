
const EPS = 0.0001;
let timeSpeed = 1;
function initTankGame() {
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

    if (e.type === 'keydown') {
      if (e.code === 'Minus') {
        timeSpeed = timeSpeed/1.1
        tanksGame.addPlayer(playerA)
      }
      if (e.code === 'Equal') {
        timeSpeed = timeSpeed*1.1
      }
    }

  });

  const playerA = new Player(
    new Control('KeyW', 'KeyS', 'KeyA', 'KeyD', 'Space')
  );

  const gameLayout = document.getElementById('game');
  const tanksGame = new TanksGame(gameLayout, 1200,800);
  tanksGame.debug = true;
  tanksGame.addPlayer(playerA);

  return tanksGame;
}

const tanksGame = initTankGame();