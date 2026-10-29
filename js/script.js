

document.addEventListener('DOMContentLoaded', () => {
    // Elementos do Jogo
    const personagem = document.querySelector('.personagem');
    const obstaculo = document.querySelector('.obstaculo');
    const gameBoard = document.getElementById('game-board');
    const hudPlayerName = document.getElementById('hud-player-name');
    const scoreDisplay = document.getElementById('score-display');
    const jumpTip = document.getElementById('jump-tip');
    const difficulty = document.getElementById('difficulty-display');

    const loja = document.getElementById('loja');
    const lojaMoedas = document.getElementById('loja-moedas');
    const btnComprarMoeda = document.getElementById('btn-comprar-moeda');
    const btnComprarPulo = document.getElementById('btn-comprar-pulo');
    const btnComprarVida = document.getElementById('btn-comprar-vida');
    const btnJogarLoja = document.getElementById('btn-jogar-loja');
    const precoMoeda = document.getElementById('preco-moeda');
    const precoPulo = document.getElementById('preco-pulo');
    const precoVida = document.getElementById('preco-vida');
    const livesDisplay = document.getElementById('lives-display');

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

    const boss = document.getElementById('boss');
    const ataque = document.getElementById('ataque-boss');
    const item = document.getElementById('item-boss');
    const bossVidaDisplay = document.getElementById('boss-vida');
    const mensagemBoss = document.getElementById('mensagemBoss')
    const detalheBoss = document.getElementById('detalheBoss')
    
    
    let proximoBoss = 100;       // pontuação em que o próximo boss aparece
    let ignorarColisaoAte = 0;   // se este "let" já existir mais abaixo no arquivo, apague um dos dois

    let bossMorrendo = false;
    let duracaoAtaque = 2;
    let pausaAtaque = 800;
    let pausaItem = 1500;
    
    let bossAtivo = false;
    let bossVida = 3;
    let bossFeitos = 0;       // quantos bosses já foram derrotados
    let tipoAtaque = 'baixo'; // 'alto' ou 'baixo'
    let itemColetado = true;
    let timerBoss = null;
    let timerItem = null;

    let velocidadeObstaculo = 2; 
    let proximaVelocidade = 2;

    let imagemPersonagem = 'assets/Running-Pikachu-GIF.webp';
    let imagemMorte = 'assets/pikachuDerrotado.jpg';
    let imagemObstaculo = 'assets/pedra.png';
    
    let personagemAtual = 'pikachu'; 

    let contadorMoeda = 0;
    let contadorPulo = 0;
    let contadorVida = 0;
    
    

    const btnPikachu = document.getElementById('btn-pikachu');
    const btnMario = document.getElementById('btn-mario');

    let pulosFeitos = 0;
    let timerPulo = null;

    const raio = document.getElementById('raio-skill');
    const barraCooldown = document.getElementById('barra-cooldown');
    const barraCooldownFill = document.getElementById('barra-cooldown-fill');

    let ultimoRaio = 0;            // hora do último disparo
    const cooldownBase = 5000;
    let cooldownRaio = cooldownBase;   // a pimenta muda este valor

    // POWER-UPS
    const powerup = document.getElementById('powerup');
    const barraPoder = document.getElementById('barra-poder');
    const barraPoderFill = document.getElementById('barra-poder-fill');
    let powerupNaTela = false;
    let powerupAtivo = false;
    let invulneravel = false;
    let timerPowerup = null;   // sorteia quando o item aparece
    let timerPoderFim = null;  // encerra o efeito    // 5 segundos
    let obstaculoDestruido = false;



    let moedasTotal = parseInt(localStorage.getItem('mario_jump_moedas_total'), 10) || 0;
    let nivelMoeda = parseInt(localStorage.getItem('mario_jump_nivel_moeda'), 10) || 0;
    let nivelPulo = parseInt(localStorage.getItem('mario_jump_nivel_pulo'), 10) || 0;
    let nivelVida = parseInt(localStorage.getItem('mario_jump_nivel_vida'), 10) || 0;
    let vidas = 1;
    let multiplicadorMoeda = 1;

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


    const difficultyDisplay = document.getElementById('difficulty-display');
    

    // Recupera último nome utilizado caso exista
    const savedName = localStorage.getItem('mario_jump_player');
    if (savedName && playerInput) {
        playerInput.value = savedName;
    }

    /**
     * Inicia uma nova rodada
     */
function startGame() {
    difficulty.textContent = 'Fácil'
    moedas = 0;
    coinsDisplay.textContent = '0';
    

    vidas = 1 + nivelVida;
    livesDisplay.textContent = '❤️ ' + vidas;
    multiplicadorMoeda = 1.5 ** nivelMoeda;
    const alturaPulo = 1.2 ** nivelPulo;
    const tempoPulo = Math.round(650 * Math.sqrt(alturaPulo)); // mais alto = um pouco mais de tempo no ar
    personagem.style.setProperty('--pulo', alturaPulo);
    personagem.style.setProperty('--tempo-pulo', tempoPulo + 'ms');
    personagem.style.setProperty('--tempo-pulo-duplo', Math.round(tempoPulo * 1.35) + 'ms');
    
    clearInterval(gameLoop);
    clearInterval(scoreLoop);

    isPlaying = true;
    score = 0;
    velocidadeObstaculo = 2;
    proximaVelocidade = 2;

    resetElements();
    ultimoRaio = 0; // raio começa pronto
    barraCooldown.style.display = personagemAtual === 'pikachu' ? 'block' : 'none';
    // se for o pikachu, tem barra, se for outro personagem, nao tem barra
    
    resetBoss();
    bossFeitos = 0;
    proximoBoss = 100;
    atualizarCenario();
    
    clearTimeout(timerPowerup);
    esconderPowerup();
    encerrarPowerup();
    agendarPowerup();

    scoreDisplay.textContent = '0';
    hudPlayerName.textContent = currentPlayer || 'Jogador';

    gameBoard.classList.add('running');
    reiniciarObstaculo(); // cano começa limpo e com 1s de folga (já reinicia a moeda também)

    scoreLoop = setInterval(() => {
        if (isPlaying && !bossAtivo) { // durante o boss o placar congela
            score += 1;
            scoreDisplay.textContent = score;
            verificarBoss();
        }
    }, 100);

    gameLoop = setInterval(checkCollision, 10);
}


    function resetElements() {
        obstaculoDestruido = false;
        obstaculo.style.visibility = 'visible';
        personagem.classList.remove('jump-duplo');
        clearTimeout(timerPulo);
        pulosFeitos = 0;

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
    if (jumpTip) jumpTip.style.opacity = '0';

    // Pikachu: um pulo só
    if (personagemAtual !== 'mario') {
        if (personagem.classList.contains('jump')) return;
        personagem.classList.add('jump');
        return;
    }

    // Mario: no máximo 2 pulos
    if (pulosFeitos >= 2) return;
    pulosFeitos += 1;

    if (pulosFeitos === 1) {
        personagem.classList.add('jump');
    } else {
        // Segundo pulo: remove o pulo simples e dispara a animação de pulo duplo
        personagem.classList.remove('jump');
        void personagem.offsetWidth; // Força o reflow para reiniciar a animação
        personagem.classList.add('jump-duplo');
        personagem.src = 'assets/saltoDuploMario.png';
    }
}   
personagem.addEventListener('animationend', (e) => {
    if (e.animationName === 'jump-animation') {
        personagem.classList.remove('jump');
        pulosFeitos = 0;
    } else if (e.animationName === 'jump-duplo-animation') {
        if (!isPlaying) return;
        personagem.classList.remove('jump-duplo');
        personagem.src = imagemPersonagem;
        pulosFeitos = 0;
    }
});

    // O fim do pulo é detectado pela própria animação (nada de timers que desencontram)
    // personagem.addEventListener('animationend', (e) => {
    //     if (e.animationName === 'jump-animation') {
    //         personagem.classList.remove('jump');
    //         pulosFeitos = 0;
    //     } else if (e.animationName === 'jump-duplo-animation') {
    //         if (!isPlaying) return; // morreu no pulo: não mexe no sprite de morte
    //         personagem.classList.remove('jump-duplo');
    //         personagem.style.bottom = '0px';
    //         personagem.src = imagemPersonagem;
    //         pulosFeitos = 0;
    //     }
    // });

    function checkCollision() {
        if (!isPlaying) return;
        atualizarBarraCooldown();
        checarPowerup();
        if (bossAtivo) {
        checarItem();
        checarMoeda();
        checarAtaque();
        return; // durante o boss, os canos não contam
    }

        // Mudou a dificuldade: reinicia o cano lá na frente e troca o fundo
        if (velocidadeObstaculo !== proximaVelocidade) {
            velocidadeObstaculo = proximaVelocidade;
            atualizarCenario();
            reiniciarObstaculo();
            return; // pula a checagem de colisão neste ciclo (a posição lida já está velha)
        }

        if (Date.now() < ignorarColisaoAte) return;
        // date.now fala... a hora de agora. qq vc pensou que seria?
        // enquanto nao for a hora certa, n faz nada
        const pipePosition = obstaculo.offsetLeft;
        const marioPosition = +window.getComputedStyle(personagem).bottom.replace('px', '');

        if (pipePosition <= 120 && pipePosition > 0 && marioPosition < 80 && !obstaculoDestruido && !invulneravel) {
            personagem.style.opacity = '0.4';
            setTimeout(() => {personagem.style.opacity = '1';}, 300)
            perderVida(pipePosition, marioPosition);
        }

        checarMoeda()
    }
    function perderVida(pos, altura) {
        if (invulneravel) return;
        vidas -= 1;
        livesDisplay.textContent = vidas;
        personagem.style.opacity = '0.4';
        setTimeout(() => {
            personagem.style.opacity = '1';
        }, 300)
        if (vidas <= 0) {
            triggerGameOver(pos, altura);
            return;
        }

        // perdeu um coração mas continua: o cano some até o próximo ciclo
        obstaculoDestruido = true;
        obstaculo.style.visibility = 'hidden';
    }

    function triggerGameOver(pipePosition, marioPosition) {

        bossAtivo = false;

        isPlaying = false;

        clearTimeout(timerPowerup);
        esconderPowerup();
        encerrarPowerup();

        moedas = Math.floor(moedas);
        moedasTotal += moedas;
        localStorage.setItem('mario_jump_moedas_total', moedasTotal);

        clearInterval(gameLoop);
        clearInterval(scoreLoop);
        moeda.style.animation = 'none';
        moeda.style.visibility = 'hidden';

        
        gameBoard.classList.remove('running');

        
        obstaculo.style.animation = 'none';
        obstaculo.style.left = `${pipePosition}px`;
        
        clearTimeout(timerBoss);
        clearTimeout(timerItem);
        ataque.style.animation = 'none';
        ataque.style.left = `${pipePosition}px`;
        item.style.display = 'none';

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
            atualizarLoja();
            loja.classList.add('active');
        }
    });

    // 4. Botão "TROCAR JOGADOR" no Game Over
    btnChangePlayer.addEventListener('click', () => {
        gameoverModal.classList.remove('active');
        resetElements();
        resetBoss();
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
        if (e.code === 'KeyZ') {
            if (isPlaying) {
                e.preventDefault();
                usarRaio();
            }
}
    });

    // SELECIONAR PERSONAGENS


    function selecionarPikachu() {
        btnPikachu.classList.add('selecionado');
        btnMario.classList.remove('selecionado');
        personagemAtual = 'pikachu';
        imagemPersonagem = 'assets/Running-Pikachu-GIF.webp';
        imagemMorte = 'assets/pikachuDerrotado.jpg';
        imagemObstaculo = 'assets/pedra.png';
    }

    function selecionarMario() {
        btnMario.classList.add('selecionado');
        btnPikachu.classList.remove('selecionado');
        personagemAtual = 'mario';
        imagemPersonagem = 'assets/mario.gif';
        imagemMorte = 'assets/marioDerrotado.png';
        imagemObstaculo = 'assets/canoMario.png';
    }
    btnPikachu.classList.add('selecionado');

    document.getElementById('btn-pikachu')
        .addEventListener('click', selecionarPikachu);

    document.getElementById('btn-mario')
        .addEventListener('click', selecionarMario);
    
    obstaculo.addEventListener('animationiteration', () => {
        if (!isPlaying) return;
        obstaculoDestruido = false;
        obstaculo.style.visibility = 'visible';
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
    // startGame();


    });
    // function atualizarDificuldade() {
    // if (bossAtivo) return;
    // // Apenas define qual será a próxima velocidade sem alterar o CSS na hora
    // if (score >= 250) {
    //     proximaVelocidade = 1;   // Difícil (1s)
    // } else if (score >= 100) {
    //     proximaVelocidade = 1.5; // Médio (1.5s)
    // }
    // }
    function atualizarCenario() {
        // Define a classe de dificuldade baseada na velocidade atual
        let nivelDificuldade = 'facil';
        // difficulty.value = 'Fácil';
        
        if (velocidadeObstaculo === 1.5) {
            nivelDificuldade = 'medio';
            // difficulty.value = 'Médio';
            
        } else if (velocidadeObstaculo === 1) {
            nivelDificuldade = 'dificil';
            // difficulty.value = 'Difícil';
        }

        // Aplica a classe combinada no fundo (Ex: "bg-pikachu-facil", "bg-mario-dificil")
        gameBoard.className = `game-board running bg-${personagemAtual}-${nivelDificuldade}`;
    }


    function reiniciarObstaculo() {
        obstaculoDestruido = false;
        obstaculo.style.visibility = 'visible';
        obstaculo.style.animation = 'none';
        void obstaculo.offsetWidth;
        obstaculo.style.animation = '';
        obstaculo.style.animationDuration = `${velocidadeObstaculo}s`;
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
        moedas += multiplicadorMoeda;
        coinsDisplay.textContent = Math.floor(moedas);
        moeda.style.visibility = 'hidden';
    }
    }
        // ===== BOSS =====
        function verificarBoss() {
        if (bossAtivo) return;

        if (score >= proximoBoss) {
            iniciarBoss();
        }
    }

    function iniciarBoss() {
        bossAtivo = true;
        bossMorrendo = false;
        bossVida = 3;

        esconderPowerup(); // se um power-up estiver na tela, ele some (o efeito já ativo continua)

        // cada boss é mais difícil que o anterior
        if (bossFeitos === 0) {          // entre o Fácil e o Médio
            duracaoAtaque = 1.75;
            pausaAtaque = 700;
            pausaItem = 1800;
        } else if (bossFeitos === 1) {   // entre o Médio e o Difícil
            duracaoAtaque = 1.25;
            pausaAtaque = 550;
            pausaItem = 2200;
        } else if (bossFeitos === 2) {   // 1º boss do Difícil
            duracaoAtaque = 0.9;
            pausaAtaque = 450;
            pausaItem = 2600;
        } else if (bossFeitos === 3) {
            duracaoAtaque = 0.85;
            pausaAtaque = 400;
            pausaItem = 3000;
        } else {                         // do 5º em diante fica nesse nível
            duracaoAtaque = 0.8;
            pausaAtaque = 350;
            pausaItem = 3500;
        }

        obstaculo.style.display = 'none'; // o cano some durante o boss
        boss.classList.remove('boss-derrotado');
        boss.src = 'assets/boss.png';
        boss.style.display = 'block';
        bossVidaDisplay.style.display = 'block';
        bossVidaDisplay.textContent = 'BOSS: ' + bossVida;

        mensagemBoss.style.opacity = '1';
        detalheBoss.style.opacity = '1';

        setTimeout(() => {
            mensagemBoss.style.opacity = '0';
            detalheBoss.style.opacity = '0';
        }, 2200)

        timerBoss = setTimeout(prepararAtaque, 1000);
        timerItem = setTimeout(lancarItem, 3000);
    }

    function finalizarBoss() {
        bossFeitos += 1;
        resetBoss();

        if (bossFeitos === 1) {
            proximaVelocidade = 1.5;   // Fácil -> Médio
            proximoBoss = 250;
        } else if (bossFeitos === 2) {
            proximaVelocidade = 1;     // Médio -> Difícil
            proximoBoss = 450;
        } else {
            proximoBoss = score + 200; // Difícil: próximo boss, mais difícil
        }
    }

    function prepararAtaque() {
        if (!bossAtivo || bossMorrendo) return;

        // sorteia o tipo do ataque e mostra a animação do boss
        tipoAtaque = Math.random() < 0.5 ? 'alto' : 'baixo';
        boss.src = 'assets/animacaoAtaqueBoss.png';

        timerBoss = setTimeout(lancarAtaque, 1000);
    }

    function lancarAtaque() {
        if (!bossAtivo || bossMorrendo) return;

        boss.src = 'assets/boss.png';
        ataque.style.bottom = tipoAtaque === 'alto' ? '170px' : '0px';
        ataque.style.visibility = 'visible';
        ataque.style.display = 'block';

        // reinicia a animação do ataque (agora com a velocidade do boss)
        ataque.classList.remove('lancado');
        void ataque.offsetWidth;
        ataque.style.animationDuration = `${duracaoAtaque}s`;
        ataque.classList.add('lancado');
    }

    function lancarItem() {
        if (!bossAtivo || bossMorrendo) return;

        const altura = alturasMoeda[Math.floor(Math.random() * alturasMoeda.length)];
        item.style.bottom = `${altura}px`;
        item.style.display = 'block';
        itemColetado = false;

        item.classList.remove('lancado');
        void item.offsetWidth;
        item.classList.add('lancado');
    }

    function checarAtaque() {
        const posAtaque = ataque.offsetLeft;
        const posPersonagem = +window.getComputedStyle(personagem).bottom.replace('px', '');

        if (posAtaque <= 120 && posAtaque > 0 && ataque.style.visibility !== 'hidden') {
        // ataque alto: acerta quem pula / ataque baixo: acerta quem está no chão
            if ((tipoAtaque === 'alto' && posPersonagem > 40) || (tipoAtaque === 'baixo' && posPersonagem < 80)) {
                perderVida(posAtaque, posPersonagem);
                if (isPlaying) ataque.style.visibility = 'hidden';
            }
        }
    }

    function checarItem() {
        if (itemColetado) return;

        const i = item.getBoundingClientRect();
        const p = personagem.getBoundingClientRect();

        const tocou =
            i.right > p.left + 30 &&
            i.left < p.right - 30 &&
            i.bottom > p.top + 20 &&
            i.top < p.bottom - 10;

        if (tocou) {
            itemColetado = true;
            item.style.display = 'none';
            timerItem = setTimeout(lancarItem, pausaItem); // próximo item
            danoBoss();
        }
    }

    function danoBoss() {
        bossVida -= 1;
        bossVidaDisplay.textContent = 'BOSS: ' + '❤️'.repeat(bossVida);

        boss.classList.add('boss-dano');
        setTimeout(() => {
            boss.classList.remove('boss-dano');
        }, 300);

        if (bossVida <= 0) {
            vencerBoss();
        }
    }

    function vencerBoss() {
        bossMorrendo = true;
        clearTimeout(timerBoss);
        clearTimeout(timerItem);

        moedas += 50;
        coinsDisplay.textContent = Math.floor(moedas);
        // A redonda

        // some com ataque, item e vida
        ataque.style.display = 'none';
        ataque.classList.remove('lancado');
        item.style.display = 'none';
        item.classList.remove('lancado');
        itemColetado = true;
        bossVidaDisplay.style.display = 'none';

        // imagem de morte + desaparece aos poucos (transição do CSS)
        boss.src = 'assets/bossDefeated.png';
        boss.classList.add('boss-derrotado');

        // quando terminar o sumiço, libera a próxima dificuldade
        timerBoss = setTimeout(finalizarBoss, 2000);
    }

    

    function resetBoss() {
        bossAtivo = false;
        bossMorrendo = false;
        clearTimeout(timerBoss);
        clearTimeout(timerItem);

        boss.style.display = 'none';
        boss.src = 'assets/boss.png';
        boss.classList.remove('boss-derrotado');
        boss.classList.remove('boss-dano');
        bossVidaDisplay.style.display = 'none';

        ataque.style.display = 'none';
        ataque.style.animation = '';
        ataque.style.left = '';
        ataque.classList.remove('lancado');

        item.style.display = 'none';
        item.classList.remove('lancado');
        itemColetado = true;

        obstaculo.style.display = ''; // o cano volta
    }

    // quando o ataque / item termina de atravessar a tela
    ataque.addEventListener('animationend', () => {
        ataque.classList.remove('lancado');
        ataque.style.display = 'none';
        if (bossAtivo && !bossMorrendo) {
            timerBoss = setTimeout(prepararAtaque, pausaAtaque);
        }
    });

    item.addEventListener('animationend', () => {
        item.classList.remove('lancado');
        item.style.display = 'none';
        itemColetado = true;
        if (bossAtivo && !bossMorrendo) {
            timerItem = setTimeout(lancarItem, pausaItem);
        }
    });
    function atualizarBarraCooldown() {
        let porcentagem = ((Date.now() - ultimoRaio) / cooldownRaio) * 100;
        if (porcentagem > 100) porcentagem = 100;
        barraCooldownFill.style.width = `${porcentagem}%`;
    }

    function usarRaio() {
        if (!isPlaying || personagemAtual !== 'pikachu') return;
        if (Date.now() - ultimoRaio < cooldownRaio) return; // ainda em cooldown

        const alvo = bossAtivo ? boss : obstaculo;

        if (bossAtivo && bossMorrendo) return;
        if (!bossAtivo) {
            if (obstaculoDestruido) return;
            // cano fora da tela: não gasta o cooldown
            if (alvo.offsetLeft <= 0 || alvo.offsetLeft >= gameBoard.offsetWidth) return;
        }

        ultimoRaio = Date.now();

        // centraliza o raio no alvo (45 = metade da largura do raio no CSS)
        raio.style.left = `${alvo.offsetLeft + alvo.offsetWidth / 2 - 45}px`;
        raio.style.display = 'block';
        setTimeout(() => {
            raio.style.display = 'none';
        }, 400);

        if (bossAtivo) {
            danoBoss(); // tira 1 de vida do boss
        } else {
            obstaculo.style.visibility = 'hidden';
            obstaculoDestruido = true;
        }
    }
        // ===== POWER-UPS =====
    function agendarPowerup() {
        clearTimeout(timerPowerup);
        timerPowerup = setTimeout(lancarPowerup, 8000 + Math.random() * 7000); // 8 a 15s
    }

    function lancarPowerup() {
        if (!isPlaying) return;
        if (bossAtivo || powerupAtivo) { agendarPowerup(); return; } // não aparece no boss nem com poder ativo

        powerup.src = personagemAtual === 'mario' ? 'assets/marioStar.png' : 'assets/pimenta.png';
        powerup.style.bottom = `${alturasMoeda[Math.floor(Math.random() * alturasMoeda.length)]}px`;
        powerup.style.display = 'block';
        powerupNaTela = true;

        powerup.classList.remove('lancado');
        void powerup.offsetWidth;          // reinicia a animação
        powerup.classList.add('lancado');
    }

    function esconderPowerup() {
        powerup.classList.remove('lancado');
        powerup.style.display = 'none';
        powerupNaTela = false;
    }

    // passou da tela sem ser pego
    powerup.addEventListener('animationend', () => {
        esconderPowerup();
        if (isPlaying) agendarPowerup();
    });

    function checarPowerup() {
        if (!powerupNaTela) return;
        const w = powerup.getBoundingClientRect();
        const p = personagem.getBoundingClientRect();

        const tocou =
            w.right > p.left + 30 &&
            w.left < p.right - 30 &&
            w.bottom > p.top + 20 &&
            w.top < p.bottom - 10;

        if (tocou) {
            esconderPowerup();
            ativarPowerup();
        }
    }

    function ativarPowerup() {
        clearTimeout(timerPoderFim);
        const mario = personagemAtual === 'mario';
        const duracao = mario ? 5000 : 15000;

        if (mario) {
            invulneravel = true;
            personagem.classList.add('personagem-estrela');
        } else {
            cooldownRaio = cooldownBase / 2;   // cooldown cai pela metade (2,5s)
            personagem.classList.add('personagem-pimenta');
        }
        powerupAtivo = true;

        // barra: some sozinha quando acaba
        barraPoderFill.style.background = mario
            ? 'linear-gradient(180deg, #fff3a0, #ffcc00)'
            : 'linear-gradient(180deg, #ff8a80, #e53935)';
        barraPoder.style.display = 'block';
        barraPoderFill.style.animation = 'none';
        void barraPoderFill.offsetWidth;
        barraPoderFill.style.animation = `poder-acaba ${duracao}ms linear forwards`;

        timerPoderFim = setTimeout(encerrarPowerup, duracao);
    }

    function encerrarPowerup() {
        clearTimeout(timerPoderFim);
        invulneravel = false;
        powerupAtivo = false;
        cooldownRaio = cooldownBase;
        personagem.classList.remove('personagem-estrela', 'personagem-pimenta');
        barraPoder.style.display = 'none';
        barraPoderFill.style.animation = 'none';
    }

    // Sorteia nova altura toda vez que a moeda reaparece na direita
    moeda.addEventListener('animationiteration', sortearMoeda);
    function reiniciarObstaculo() {
    obstaculo.style.animation = 'none';
    void obstaculo.offsetWidth;
    obstaculo.style.animation = '';
    obstaculo.style.animationDuration = `${velocidadeObstaculo}s`;
    reiniciarMoeda(); 
}
    btnConfirmar.addEventListener('click', () => {
        selectCharacter.classList.remove('active');
        atualizarLoja();
        loja.classList.add('active');
    });
    function atualizarLoja() {
        
        const pMoeda = 30 + 15 * nivelMoeda;
        const pPulo = 30 + 15 * nivelPulo;
        const pVida = 30 + 15 * nivelVida;

        lojaMoedas.textContent = moedasTotal;
        precoMoeda.textContent = pMoeda;
        precoPulo.textContent = pPulo;
        precoVida.textContent = pVida;

        // apaga o botão se não tiver moedas suficientes
        btnComprarMoeda.disabled = moedasTotal < pMoeda;
        btnComprarPulo.disabled = moedasTotal < pPulo;
        btnComprarVida.disabled = moedasTotal < pVida;
        

        if(contadorMoeda >= 3){
            btnComprarMoeda.disabled;
        }
        if(contadorPulo >= 3){
            btnComprarPulo.disabled;
        }
        if(contadorVida >= 3){
            btnComprarVida.disabled;
        }
        // btnComprarMoeda.disabled = contadorMoeda >= 3;
        // btnComprarPulo.disabled = contadorPulo >= 3;
        // btnComprarVida.disabled = contadorVida >= 3;

    }

    function comprar(tipo) {
        let nivel = nivelVida;
        if (tipo === 'moeda') nivel = nivelMoeda;
        if (tipo === 'pulo') nivel = nivelPulo;

        const preco = 30 + 15 * nivel;
        if (moedasTotal < preco) return;

        moedasTotal -= preco; // subtrai do total

        if (tipo === 'moeda') nivelMoeda += 1;
        else if (tipo === 'pulo') nivelPulo += 1;
        else nivelVida += 1;

        localStorage.setItem('mario_jump_moedas_total', moedasTotal);
        localStorage.setItem('mario_jump_nivel_moeda', nivelMoeda);
        localStorage.setItem('mario_jump_nivel_pulo', nivelPulo);
        localStorage.setItem('mario_jump_nivel_vida', nivelVida);

        atualizarLoja();
    }

    btnComprarMoeda.addEventListener('click', () => {
        comprar('moeda');
        contadorMoeda += 1;    
    });
    btnComprarPulo.addEventListener('click', () => {
        comprar('pulo')
        contadorPulo += 1
    });
    btnComprarVida.addEventListener('click', () => {
        comprar('vida')
        contadorMoeda += 1
    });

    btnJogarLoja.addEventListener('click', () => {
        loja.classList.remove('active');
        startGame();
    });

});
