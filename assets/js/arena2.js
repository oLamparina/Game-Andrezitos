document.addEventListener('DOMContentLoaded', () => {
    // Referências do DOM
    const gameContainer = document.getElementById('game-container');
    const player = document.getElementById('player');
    const lobo = document.getElementById('lobo');
    const playerHealthBar = document.getElementById('player-health-bar');
    const wolfHealthText = document.getElementById('wolf-health-text');

    // Overlays e Botões
    const cardOverlay = document.getElementById('card-choice-overlay');
    const deathOverlay = document.getElementById('death-overlay');
    const reviveButton = document.getElementById('revive-button');
    const btnF = document.getElementById('btn-f');
    const cooldownDisplay = document.getElementById('cooldown-display');
    const cooldownTimer = document.getElementById('cooldown-timer');

    // --- Estado do Jogo ---
    let gamePaused = true;
    let gameOver = false;

    // --- Configurações do Jogador ---
    const playerState = {
        health: 230,
        maxHealth: 230,
        x: window.innerWidth / 2 - 40,
        y: 10,
        vy: 0,
        speed: 8,
        jumpPower: 18,
        isJumping: false,
        isImmune: false,
        attackDamage: 10,
        facingRight: true,
    };

    // --- Configurações do Lobo ---
    const wolfState = {
        health: 100,
        maxHealth: 100,
        x: window.innerWidth - 150,
        y: 10,
        speed: 2.5,
        damage: 50,
        facingRight: false
    };

    // --- Configurações da Habilidade F (Raio) ---
    const lightningAbility = {
        enabled: false,
        damage: 25,
        cooldown: 10000, // 10 segundos em ms
        onCooldown: false,
    };

    // --- Controles ---
    let keys = {};
    document.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
    document.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

    // --- Lógica das Cartas ---
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', (e) => {
            const choice = e.target.dataset.choice;
            applyCardEffect(choice);
            cardOverlay.classList.add('hidden');
            gamePaused = false;
        }, { once: true });
    });

    function applyCardEffect(choice) {
        if (choice === 'damage') {
            playerState.attackDamage = 20;
        } else if (choice === 'speed') {
            playerState.speed = 12;
        } else if (choice === 'lightning') {
            lightningAbility.enabled = true;
            btnF.classList.remove('hidden');
        }
    }
    
    // --- Lógica de Movimento e Física ---
    const gravity = 0.8;
    const groundPosition = 10;

    function handlePlayerMovement() {
        // Movimento Horizontal
        if (keys['a']) {
            playerState.x -= playerState.speed;
            player.src = 'assets/images/playerEspelho.png';
            playerState.facingRight = false;
        }
        if (keys['d']) {
            playerState.x += playerState.speed;
            player.src = 'assets/images/player.png';
            playerState.facingRight = true;
        }

        // Limites da Tela
        if (playerState.x < 0) playerState.x = 0;
        if (playerState.x > gameContainer.clientWidth - player.width) {
            playerState.x = gameContainer.clientWidth - player.width;
        }

        // Movimento Vertical (Pulo e Gravidade)
        playerState.vy -= gravity;
        playerState.y += playerState.vy;

        if (playerState.y <= groundPosition) {
            playerState.y = groundPosition;
            playerState.vy = 0;
            playerState.isJumping = false;
        }

        // Atualiza a posição no DOM
        player.style.left = `${playerState.x}px`;
        player.style.bottom = `${playerState.y}px`;
    }
    
    function jump() {
        if (!playerState.isJumping) {
            playerState.isJumping = true;
            playerState.vy = playerState.jumpPower;
        }
    }

    // --- Lógica do Lobo (IA) ---
    function handleWolfAI() {
        const playerCenter = playerState.x + (player.width / 2);
        const wolfCenter = wolfState.x + (lobo.width / 2);
        
        if (playerCenter < wolfCenter - 5) { // Persegue pela esquerda
            wolfState.x -= wolfState.speed;
            lobo.src = 'assets/images/loboEspelho.png';
            wolfState.facingRight = false;
        } else if (playerCenter > wolfCenter + 5) { // Persegue pela direita
            wolfState.x += wolfState.speed;
            lobo.src = 'assets/images/lobo.png';
            wolfState.facingRight = true;
        }
        
        // Limites da tela
        if (wolfState.x < 0) wolfState.x = 0;
        if (wolfState.x > gameContainer.clientWidth - lobo.width) {
            wolfState.x = gameContainer.clientWidth - lobo.width;
        }

        lobo.style.left = `${wolfState.x}px`;
    }

    // --- Lógica de Combate ---
    function shootPower() {
        const projectile = document.createElement('div');
        projectile.classList.add('power-projectile');
        
        const startX = playerState.facingRight ? playerState.x + player.width : playerState.x - 40;
        const startY = playerState.y + player.height / 2;
        
        projectile.style.left = `${startX}px`;
        projectile.style.bottom = `${startY}px`;
        
        gameContainer.appendChild(projectile);

        const direction = playerState.facingRight ? 1 : -1;
        
        const moveInterval = setInterval(() => {
            let currentX = parseFloat(projectile.style.left);
            currentX += 15 * direction;
            projectile.style.left = `${currentX}px`;

            // Remove se sair da tela
            if (currentX < -50 || currentX > window.innerWidth) {
                projectile.remove();
                clearInterval(moveInterval);
            }
            // Checa colisão com o lobo
            if(isColliding(projectile, lobo)) {
                takeDamage(lobo, playerState.attackDamage, 'wolf');
                projectile.remove();
                clearInterval(moveInterval);
            }
        }, 16);
    }
    
    function useLightning() {
        if (!lightningAbility.enabled || lightningAbility.onCooldown) return;

        lightningAbility.onCooldown = true;
        
        // Cria o raio
        const bolt = document.createElement('img');
        bolt.src = 'assets/images/raio.png'; // Você precisará de uma imagem para o raio
        bolt.classList.add('lightning-bolt');
        bolt.style.left = `${wolfState.x + (lobo.width / 2) - 40}px`;
        bolt.style.top = '0px';
        gameContainer.appendChild(bolt);
        
        takeDamage(lobo, lightningAbility.damage, 'wolf');
        
        setTimeout(() => bolt.remove(), 500); // Remove o raio após a animação

        // Lógica do Cooldown
        btnF.disabled = true;
        cooldownDisplay.classList.remove('hidden');
        let timeLeft = lightningAbility.cooldown / 1000;
        cooldownTimer.textContent = timeLeft;

        const cooldownInterval = setInterval(() => {
            timeLeft--;
            cooldownTimer.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(cooldownInterval);
                cooldownDisplay.classList.add('hidden');
                lightningAbility.onCooldown = false;
                btnF.disabled = false;
            }
        }, 1000);
    }

    // --- Colisão e Dano ---
    function isColliding(elem1, elem2) {
        const rect1 = elem1.getBoundingClientRect();
        const rect2 = elem2.getBoundingClientRect();
        return !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom);
    }

    function checkCollisions() {
        if (isColliding(player, lobo) && !playerState.isImmune && !gameOver) {
            takeDamage(player, wolfState.damage, 'player');
            playerState.isImmune = true;
            player.classList.add('immune');
            setTimeout(() => {
                playerState.isImmune = false;
                player.classList.remove('immune');
            }, 2000); // 2 segundos de imunidade
        }
    }
    
    function takeDamage(target, amount, type) {
        if (type === 'player') {
            playerState.health = Math.max(0, playerState.health - amount);
            updateHUD();
            if (playerState.health <= 0) {
                triggerGameOver();
            }
        } else if (type === 'wolf') {
            wolfState.health = Math.max(0, wolfState.health - amount);
            updateHUD();
            if (wolfState.health <= 0) {
                triggerWin();
            }
        }
    }
    
    // --- HUD e Fim de Jogo ---
    function updateHUD() {
        // Vida do Jogador
        const playerHealthPercent = (playerState.health / playerState.maxHealth) * 100;
        playerHealthBar.style.width = `${playerHealthPercent}%`;

        // Vida do Lobo
        wolfHealthText.textContent = `${wolfState.health}/${wolfState.maxHealth}`;
    }

    function triggerGameOver() {
    if (gameOver) return;
    gameOver = true;
    gamePaused = true;
    window.location.href = 'morte2.html';
}

    function triggerWin() {
        if (gameOver) return;
        gameOver = true;
        gamePaused = true;
        // Redirecionamentos possíveis: 'win.html', 'arena1a.html'
        // Seguindo a especificação principal de "derrotar o lobo":
        window.location.href = 'arena1a.html'; 
    }

    reviveButton.addEventListener('click', () => {
        window.location.href = 'arena1.html';
    });

    // --- Controles na Tela ---
    const setupOnScreenControls = () => {
        const controls = {
            'btn-left': 'a',
            'btn-right': 'd',
        };

        for (const [btnId, key] of Object.entries(controls)) {
            const btn = document.getElementById(btnId);
            btn.addEventListener('touchstart', (e) => { e.preventDefault(); keys[key] = true; }, { passive: false });
            btn.addEventListener('touchend', (e) => { e.preventDefault(); keys[key] = false; }, { passive: false });
            btn.addEventListener('mousedown', (e) => { e.preventDefault(); keys[key] = true; });
            btn.addEventListener('mouseup', (e) => { e.preventDefault(); keys[key] = false; });
            btn.addEventListener('mouseleave', (e) => { keys[key] = false; });
        }
        
        // Ações (pressionar uma vez)
        document.getElementById('btn-jump').addEventListener('click', (e) => { e.preventDefault(); jump(); });
        document.getElementById('btn-attack').addEventListener('click', (e) => { e.preventDefault(); shootPower(); });
        btnF.addEventListener('click', (e) => { e.preventDefault(); useLightning(); });
    };


    // --- Loop Principal do Jogo ---
    function gameLoop() {
        if (!gamePaused && !gameOver) {
            handlePlayerMovement();
            handleWolfAI();
            checkCollisions();

            // Ações disparadas por teclas
            if (keys[' ']) jump(); // Tecla de Espaço para pular
            if (keys['x']) { // Tecla X para atacar
                 shootPower();
                 keys['x'] = false; // Para não atirar continuamente
            }
            if (keys['f']) { // Tecla F para raio
                useLightning();
                keys['f'] = false; // Para não disparar continuamente
            }
        }
        requestAnimationFrame(gameLoop);
    }
    
    // --- Inicialização ---
    updateHUD();
    setupOnScreenControls();
    gameLoop();
});