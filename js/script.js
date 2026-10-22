

document.addEventListener('DOMContentLoaded', () => {
    // Elementos do Jogo
    const personagem = document.querySelector('.personagem');
    const obstaculo = document.querySelector('.obstaculo');
    const gameBoard = document.getElementById('game-board');
    const hudPlayerName = document.getElementById('hud-player-name');
    const scoreDisplay = document.getElementById('score-display');
    const jumpTip = document.getElementById('jump-tip');

    // Modais e Telas
    const startModal = document.getElementById('start-modal');
    const startForm = document.getElementById('start-form');
    const playerInput = document.getElementById('player-input');
    const btnViewRanking = document.getElementById('btn-view-ranking');

    const gameoverModal = document.getElementById('gameover-modal');
    const finalScoreValue = document.getElementById('final-score-value');
    const saveStatusMsg = document.getElementById('save-status-msg');
    const rankingBody = document.getElementById('ranking-body');
    const btnRestart = document.getElementById('btn-restart');
    const btnChangePlayer = document.getElementById('btn-change-player');
    const selectCharacter = document.getElementById('select-caracter');
    const btnConfirmar = document.getElementById('btn-confirmar-personagem');

    let velocidadeObstaculo = 2; 
    let proximaVelocidade = 2;

    let imagemPersonagem = 'assets/Running-Pikachu-GIF.webp';
    let imagemMorte = 'assets/pikachuDerrotado.jpg';
    let imagemObstaculo = 'assets/pedra.png';

    let personagemAtual = 'pikachu'; 

    const moeda = document.getElementById('moeda');
    const coinsDisplay = document.getElementById('coins-display');
    let moedas = 0;
    let moedaColetada = false;
    const alturasMoeda = [20, 110, 170]; // chão, meio, no alto (precisa pular)

    // Variáveis de Estado
    let currentPlayer = '';
    let score = 0;
    let isPlaying = false;
    let gameLoop = null;
    let scoreLoop = null;

    // Recupera último nome utilizado caso exista
    const savedName = localStorage.getItem('mario_jump_player');
    if (savedName && playerInput) {
        playerInput.value = savedName;
    }

    /**
     * Inicia uma nova rodada
     */
   function startGame() {
    moedas = 0;
    coinsDisplay.textContent = '0'; 
    clearInterval(gameLoop);
    clearInterval(scoreLoop);

    // 1º: reseta o estado
    isPlaying = true;
    score = 0;
    velocidadeObstaculo = 2;
    proximaVelocidade = 2;

    // 2º: só depois atualiza visual
    resetElements();
    atualizarCenario();

    scoreDisplay.textContent = '0';
    hudPlayerName.textContent = currentPlayer || 'Jogador';

    gameBoard.classList.add('running');
    obstaculo.style.animationDuration = `${velocidadeObstaculo}s`;
    void obstaculo.offsetWidth; // força o cano a reiniciar do começo

    scoreLoop = setInterval(() => {
        if (isPlaying) {
            score += 1;
            scoreDisplay.textContent = score;
            atualizarDificuldade();
        }
    }, 100);

    gameLoop = setInterval(checkCollision, 10);
}


    function resetElements() {
        obstaculo.src = imagemObstaculo;
        obstaculo.style.animation = '';
        obstaculo.style.animationDuration = ''; 
        obstaculo.style.left = '';

        personagem.style.animation = '';
        personagem.src = imagemPersonagem;
        personagem.style.bottom = '0px';
        personagem.style.width = '';
        personagem.style.marginLeft = '';
        personagem.classList.remove('jump');

        if (jumpTip) {
            jumpTip.style.opacity = '1';
        }
    }

    function jump() {
        if (!isPlaying) return;
        if (personagem.classList.contains('jump')) return;

        personagem.classList.add('jump');

        if (jumpTip) {
            jumpTip.style.opacity = '0';
        }

        setTimeout(() => {
            personagem.classList.remove('jump');
        }, 500);
    }

    function checkCollision() {
        if (!isPlaying) return;

        // Mudou a dificuldade: reinicia o cano lá na frente e troca o fundo
        if (velocidadeObstaculo !== proximaVelocidade) {
            velocidadeObstaculo = proximaVelocidade;
            atualizarCenario();
            reiniciarObstaculo();
            return; // pula a checagem de colisão neste ciclo (a posição lida já está velha)
        }

        const pipePosition = obstaculo.offsetLeft;
        const marioPosition = +window.getComputedStyle(personagem).bottom.replace('px', '');

        if (pipePosition <= 120 && pipePosition > 0 && marioPosition < 80) {
            triggerGameOver(pipePosition, marioPosition);
        }
        checarMoeda()
    }

    function triggerGameOver(pipePosition, marioPosition) {

        isPlaying = false;
        clearInterval(gameLoop);
        clearInterval(scoreLoop);
        moeda.style.animation = 'none';
        moeda.style.visibility = 'hidden';

        
        gameBoard.classList.remove('running');

        
        obstaculo.style.animation = 'none';
        obstaculo.style.left = `${pipePosition}px`;

        // Congela o Mario na altura exata e muda para a imagem de Game Over
        personagem.style.animation = 'none';
        personagem.style.bottom = `${marioPosition}px`;
        personagem.src = imagemMorte;
        personagem.style.width = '150px';
        personagem.style.marginLeft = '0px';

        // Atualiza modal de Game Over
        finalScoreValue.textContent = score;
        saveStatusMsg.textContent = 'Salvando pontuação no banco...';
        saveStatusMsg.style.color = '#ffcc00';

        // Abre modal de Game Over
        gameoverModal.classList.add('active');

        // Salva a pontuação no banco MySQL via PHP
        saveScore(currentPlayer, score);
    }


    function saveScore(playerName, finalScore) {
        fetch('config/salvar_ranking.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome: playerName,
                pontos: finalScore,
                moedas: moedas
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                saveStatusMsg.textContent = 'Pontuação registrada no banco!';
                saveStatusMsg.style.color = '#10b981';
                if (data.ranking) {
                    renderRanking(data.ranking, playerName, finalScore);
                }
            } else {
                saveStatusMsg.textContent = '⚠️ ' + (data.message || 'Erro ao registrar.');
                saveStatusMsg.style.color = '#ef4444';
            }
        })
        .catch(err => {
            console.error('Erro na requisição:', err);
            saveStatusMsg.textContent = '⚠️ Erro ao conectar ao servidor Laragon.';
            saveStatusMsg.style.color = '#ef4444';
        });
    }

    /**
     * Busca o ranking atualizado no banco
     */
    function fetchRanking() {
        fetch('config/obter_ranking.php')
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success' && data.ranking) {
                    renderRanking(data.ranking);
                }
            })
            .catch(err => console.error('Erro ao buscar ranking:', err));
    }

    /**
     * Atualiza a tabela HTML do ranking
     */
    function renderRanking(list, highlightName = null, highlightScore = null) {
        if (!rankingBody) return;
        rankingBody.innerHTML = '';

        if (!list || list.length === 0) {
            rankingBody.innerHTML = '<tr><td colspan="3" class="loading-cell">Nenhuma pontuação gravada ainda. Jogue para ser o 1º!</td></tr>';
            return;
        }

        let highlighted = false;

        list.forEach((item, index) => {
            const tr = document.createElement('tr');

            // Destaca a pontuação atual recém-salva se coincidir
            if (!highlighted && highlightName && item.nome === highlightName && parseInt(item.pontos, 10) === highlightScore) {
                tr.classList.add('highlight-current');
                highlighted = true;
            }

            let medal = `${index + 1}º`;
            if (index === 0) medal = '🥇 1º';
            else if (index === 1) medal = '🥈 2º';
            else if (index === 2) medal = '🥉 3º';

            tr.innerHTML = `
                <td class="ranking-pos">${medal}</td>
                <td><strong>${escapeHtml(item.nome)}</strong></td>
                <td>${parseInt(item.pontos, 10)} pts</td>
            `;

            rankingBody.appendChild(tr);
        });
    }

    /**
     * Função auxiliar para sanitizar strings no HTML
     */
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    // Submit do Formulário de Início (INICIAR JOGO)
    startForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede o recarregamento da página

        const nameValue = playerInput.value.trim();
        if (!nameValue) {
            playerInput.focus();
            return;
        }

    startModal.classList.remove('active');
    selectCharacter.classList.add('active');

    startModal.classList.remove('active');

    document.querySelector('.select-caracter').classList.add('active');
    });

    // Botão "VER RANKING" na tela inicial
    btnViewRanking.addEventListener('click', () => {
        fetchRanking();
        finalScoreValue.textContent = '---';
        saveStatusMsg.textContent = '';
        startModal.classList.remove('active');
        gameoverModal.classList.add('active');
    });

    // Botão "JOGAR NOVAMENTE" no Game Over
    btnRestart.addEventListener('click', () => {
        gameoverModal.classList.remove('active');
        if (!currentPlayer) {
            startModal.classList.add('active');
            playerInput.focus();
        } else {
            startGame();
        }
    });

    // 4. Botão "TROCAR JOGADOR" no Game Over
    btnChangePlayer.addEventListener('click', () => {
        gameoverModal.classList.remove('active');
        resetElements();
        startModal.classList.add('active');
        playerInput.value = '';
        playerInput.focus();
    });

    // 5. Controle do Pulo por Teclado (Espaço ou Seta para Cima)
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.key === ' ' || e.code === 'ArrowUp') {
            if (isPlaying) {
                e.preventDefault();
                jump();
            }
        }
    });

    // SELECIONAR PERSONAGENS


    function selecionarPikachu() {
        personagemAtual = 'pikachu';
        imagemPersonagem = 'assets/Running-Pikachu-GIF.webp';
        imagemMorte = 'assets/pikachuDerrotado.jpg';
        imagemObstaculo = 'assets/pedra.png';
    }

    function selecionarMario() {
        personagemAtual = 'mario';
        imagemPersonagem = 'assets/mario.gif';
        imagemMorte = 'assets/marioDerrotado.png';
        imagemObstaculo = 'assets/canoMario.png';
    }
    document.getElementById('btn-pikachu')
        .addEventListener('click', selecionarPikachu);

    document.getElementById('btn-mario')
        .addEventListener('click', selecionarMario);
    
    obstaculo.addEventListener('animationiteration', () => {
        if (!isPlaying) return;
        if (velocidadeObstaculo !== proximaVelocidade) {
            velocidadeObstaculo = proximaVelocidade;
            obstaculo.style.animationDuration = `${velocidadeObstaculo}s`;
            atualizarCenario();
        }
    });
    btnConfirmar.addEventListener('click', () => {

    // Fecha a seleção de personagem
    selectCharacter.classList.remove('active');

    // Começa o jogo
    startGame();

    });
    function atualizarDificuldade() {
    // Apenas define qual será a próxima velocidade sem alterar o CSS na hora
    if (score >= 250) {
        proximaVelocidade = 1;   // Difícil (1s)
    } else if (score >= 100) {
        proximaVelocidade = 1.5; // Médio (1.5s)
    }
    }
    function atualizarCenario() {
        // Define a classe de dificuldade baseada na velocidade atual
        let nivelDificuldade = 'facil';
        
        if (velocidadeObstaculo === 1.5) {
            nivelDificuldade = 'medio';
        } else if (velocidadeObstaculo === 1) {
            nivelDificuldade = 'dificil';
        }

        // Aplica a classe combinada no fundo (Ex: "bg-pikachu-facil", "bg-mario-dificil")
        gameBoard.className = `game-board running bg-${personagemAtual}-${nivelDificuldade}`;
    }

    let ignorarColisaoAte = 0;

    function reiniciarObstaculo() {
        // cria uma cópia nova e troca no lugar do cano antigo
        const novo = obstaculo.cloneNode(true);
        novo.style.animation = '';
        novo.style.left = '';
        novo.style.animationDuration = `${velocidadeObstaculo}s`;
        obstaculo.replaceWith(novo);
        obstaculo = novo;

        // pequena folga: ignora colisão por 300ms depois do reinício
        ignorarColisaoAte = Date.now() + 300;

        reiniciarMoeda();
    }
    function sortearMoeda() {
    const altura = alturasMoeda[Math.floor(Math.random() * alturasMoeda.length)];
    moeda.style.bottom = `${altura}px`;
    moeda.style.visibility = 'visible';
    moedaColetada = false;
}

function reiniciarMoeda() {
    moeda.style.animation = 'none';
    void moeda.offsetWidth;
    moeda.style.animation = '';
    moeda.style.animationDuration = `${velocidadeObstaculo}s`;
    // metade do ciclo de diferença pro cano, pra nunca aparecerem juntos
    moeda.style.animationDelay = `-${velocidadeObstaculo / 2}s`;
    sortearMoeda();
}

function checarMoeda() {
    if (moedaColetada) return;

    const m = moeda.getBoundingClientRect();
    const p = personagem.getBoundingClientRect();

    const tocou =
        m.right > p.left + 30 &&
        m.left < p.right - 30 &&
        m.bottom > p.top + 20 &&
        m.top < p.bottom - 10;

    if (tocou) {
        moedaColetada = true;
        moedas += 1;
        coinsDisplay.textContent = moedas;
        moeda.style.visibility = 'hidden';
    }
    }

    // Sorteia nova altura toda vez que a moeda reaparece na direita
    moeda.addEventListener('animationiteration', sortearMoeda);
    function reiniciarObstaculo() {
    obstaculo.style.animation = 'none';
    void obstaculo.offsetWidth;
    obstaculo.style.animation = '';
    obstaculo.style.animationDuration = `${velocidadeObstaculo}s`;
    reiniciarMoeda(); // <-- adicione
}

});