document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos do DOM
    const gameContainer = document.getElementById('game-container');
    const player = document.getElementById('player');
    const healthBar = document.getElementById('health-bar');
    const scoreDisplay = document.getElementById('score');

    // --- Configurações Iniciais do Jogo ---
    let playerHealth = 230;
    const maxHealth = 230;
    let score = 0;
    const scoreToWin = 10;
    let gamePaused = true; 
    let gameOverState = false;

    // --- Configurações do Personagem e Física ---
    let playerX = window.innerWidth / 2;
    let playerY = 10; // Posição Y inicial (no chão)
    let playerVy = 0; // Velocidade Vertical
    const gravity = 0.8; // Força da gravidade
    let playerSpeed = 15;
    let playerJumpPower = 18; // Força do pulo
    let isJumping = true; // Começa no ar para cair no chão
    const groundPosition = 10; // Deve corresponder ao 'bottom' no CSS
    let keys = {}; // Armazena as teclas pressionadas

    // --- Configurações de Dano ---
    let rayDamage = 3;
    const enemyDamage = 30;
    const enemyHealth = 9;

    // --- Assets ---
    const playerSprite = {
        right: 'assets/images/player.png',
        left: 'assets/images/playerEspelho.png'
    };

    // --- Controles (Teclado) ---
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        keys[key] = true;
        
        if (key === 'a' || key === 'arrowleft') player.src = playerSprite.left;
        else if (key === 's' || key === 'arrowright') player.src = playerSprite.right; // "S" para direita
        
        if (key === 'w' || key === 'arrowup' || key === ' ') jump();
        if (key === 'x') { // "X" para atirar
            if (!gamePaused && !gameOverState) shootRay();
        }
    });

    document.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });

    // --- Controles (Botões na Tela) ---
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    const btnJump = document.getElementById('btn-jump');
    const btnAttack = document.getElementById('btn-attack');

// Eventos para ataque por clique/touch no botão ATTACK
btnAttack.addEventListener('mousedown', (e) => {
    e.preventDefault();
    if (!gamePaused && !gameOverState) shootRay();
});
btnAttack.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!gamePaused && !gameOverState) shootRay();
});

    const startMoveLeft = (e) => { e.preventDefault(); keys['a'] = true; player.src = playerSprite.left; };
    const stopMoveLeft = (e) => { e.preventDefault(); keys['a'] = false; };
    const startMoveRight = (e) => { e.preventDefault(); keys['s'] = true; player.src = playerSprite.right; };
    const stopMoveRight = (e) => { e.preventDefault(); keys['s'] = false; };
    const doJump = (e) => { e.preventDefault(); jump(); };

    // Eventos de Toque (Mobile)
    btnLeft.addEventListener('touchstart', startMoveLeft);
    btnLeft.addEventListener('touchend', stopMoveLeft);
    btnRight.addEventListener('touchstart', startMoveRight);
    btnRight.addEventListener('touchend', stopMoveRight);
    btnJump.addEventListener('touchstart', doJump);
    // Eventos de Mouse (Desktop)
    btnLeft.addEventListener('mousedown', startMoveLeft);
    btnLeft.addEventListener('mouseup', stopMoveLeft);
    btnRight.addEventListener('mousedown', startMoveRight);
    btnRight.addEventListener('mouseup', stopMoveRight);
    btnJump.addEventListener('mousedown', doJump);

    // --- Movimentação e Ações do Jogador ---
    function movePlayer() {
        const containerWidth = gameContainer.clientWidth;
        if (keys['a'] || keys['arrowleft']) playerX -= playerSpeed;
        if (keys['s'] || keys['arrowright']) playerX += playerSpeed;

        if (playerX < 0) playerX = 0;
        if (playerX > containerWidth - player.width) playerX = containerWidth - player.width;
        
        player.style.left = `${playerX}px`;
    }
    
    function jump() {
        if (!isJumping && !gamePaused && !gameOverState) {
            isJumping = true;
            playerVy = playerJumpPower;
        }
    }

    // --- Mecânicas de Tiro e Inimigos (sem alterações significativas) ---
    function shootRay() { /* ...código de tiro inalterado... */ }
    function createEnemy() { /* ...código dos inimigos inalterado... */ }
    function isColliding(rect1, rect2) { /* ...código de colisão inalterado... */ }
    function checkPlayerCollision(enemy, interval) { /* ...código de colisão inalterado... */ }
    function checkRayCollision(ray, rayInterval) { /* ...código de colisão inalterado... */ }

    // --- Funções de Estado do Jogo ---
    function takeDamage(amount) { /* ...código de dano inalterado... */ }
    function updateHealthBar() { /* ...código da vida inalterado... */ }
    function updateScore() { /* ...código de pontuação inalterado... */ }
    function triggerGameOver() { /* ...código de fim de jogo inalterado... */ }
    function triggerWin() { /* ...código de vitória inalterado... */ }

    // --- Evento das Cartas (Lógica do Pulo Atualizada) ---
    function showCardChoice() { /* ...código da tela de cartas inalterado... */ }
    function applyCardEffect(choice) {
        if (choice === 'damage') {
            rayDamage = 9;
        } else if (choice === 'speed') {
            playerSpeed = 25;
        } else if (choice === 'jump') {
            playerJumpPower = 24; // Aumenta a força do pulo!
        }
    }

    // --- Loop Principal do Jogo (Atualizado com Física) ---
    function gameLoop() {
        if (!gamePaused && !gameOverState) {
            // 1. Aplica a física (gravidade)
            playerVy -= gravity;
            playerY += playerVy;

            // 2. Checa colisão com o chão
            if (playerY <= groundPosition) {
                playerY = groundPosition;
                playerVy = 0;
                isJumping = false;
            }
            
            // 3. Atualiza a posição visual Y
            player.style.bottom = `${playerY}px`;
            
            // 4. Processa o movimento horizontal
            movePlayer();
        }
        requestAnimationFrame(gameLoop);
    }

    // --- Inicialização ---
    function init() {
    showCardChoice(); // <-- chamada imediata
    setInterval(createEnemy, 1200);
    gameLoop();
}
    
    // Para manter o código original, as funções abaixo precisam ser copiadas
    // da resposta anterior, pois não sofreram alterações.
    // Cole aqui as funções: shootRay, createEnemy, isColliding, 
    // checkPlayerCollision, checkRayCollision, takeDamage, updateHealthBar,
    // updateScore, triggerGameOver, triggerWin, showCardChoice.
    
    // Para sua conveniência, aqui estão elas novamente:
    function shootRay() {const ray=document.createElement('div');ray.classList.add('ray');const playerRect=player.getBoundingClientRect();ray.style.left=`${playerRect.left+(playerRect.width/2)-5}px`;ray.style.top=`${playerRect.top}px`;gameContainer.appendChild(ray);const rayInterval=setInterval(()=>{const currentTop=parseInt(ray.style.top);if(currentTop<0){ray.remove();clearInterval(rayInterval);return;}ray.style.top=`${currentTop-20}px`;checkRayCollision(ray,rayInterval);},16);}
    function createEnemy(){if(gamePaused||gameOverState)return;const enemy=document.createElement('img');enemy.src='assets/images/vitoriasRegias.png';enemy.classList.add('vitoria-regia');enemy.style.left=`${Math.random()*(window.innerWidth-70)}px`;enemy.dataset.health=enemyHealth;gameContainer.appendChild(enemy);const fallInterval=setInterval(()=>{if(gamePaused||gameOverState)return;const currentTop=enemy.offsetTop;if(currentTop>window.innerHeight){enemy.remove();clearInterval(fallInterval);return;}enemy.style.top=`${currentTop+4}px`;checkPlayerCollision(enemy,fallInterval);},20);}
    function isColliding(rect1,rect2){return!(rect1.right<rect2.left||rect1.left>rect2.right||rect1.bottom<rect2.top||rect1.top>rect2.bottom);}
    function checkPlayerCollision(enemy,interval){const playerRect=player.getBoundingClientRect();const enemyRect=enemy.getBoundingClientRect();if(isColliding(playerRect,enemyRect)){enemy.remove();clearInterval(interval);takeDamage(enemyDamage);}}
    function checkRayCollision(ray,rayInterval){const rayRect=ray.getBoundingClientRect();document.querySelectorAll('.vitoria-regia').forEach(enemy=>{const enemyRect=enemy.getBoundingClientRect();if(isColliding(rayRect,enemyRect)){ray.remove();clearInterval(rayInterval);let enemyHP=parseInt(enemy.dataset.health)-rayDamage;enemy.dataset.health=enemyHP;if(enemyHP<=0){enemy.remove();updateScore();}}});}
    function takeDamage(amount){if(gameOverState)return;playerHealth=Math.max(0,playerHealth-amount);updateHealthBar();if(playerHealth<=0){triggerGameOver();}}
    function updateHealthBar(){const healthPercentage=(playerHealth/maxHealth)*100;healthBar.style.width=`${healthPercentage}%`;}
    function updateScore(){if(gameOverState)return;score++;scoreDisplay.textContent=score;if(score>=scoreToWin){triggerWin();}}
    function triggerGameOver(){gameOverState=true;gamePaused=true;window.location.href='morte1.html';}
   
    function triggerWin(){
    gameOverState = true;
    gamePaused = true;
    window.location.href = 'arena2.html';
}
    
    
    function showCardChoice(){const overlay=document.getElementById('card-choice-overlay');overlay.classList.remove('hidden');document.querySelectorAll('.card').forEach(card=>{card.addEventListener('click',(e)=>{const choice=e.target.dataset.choice;applyCardEffect(choice);overlay.classList.add('hidden');gamePaused=false;},{once:true});});}


    init();
});