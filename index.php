<?php 

    require_once 'config/conexao.php';

    $rankingInicial = [];
    try {
        $stmt = $pdo->query("
            SELECT id, nome, moedas, pontos, DATE_FORMAT(data_registro, '%d/%m/%Y %H:%i') as data 
            FROM ranking 
            ORDER BY pontos DESC, id ASC 
            LIMIT 10
        ");
        $rankingInicial = $stmt->fetchAll();
    } catch (Exception $e) {
        // Caso o banco ainda não possua registros
        $rankingInicial = [];
    }
    
    ?>
<!DOCTYPE html>
<html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SPRINT - Mario Jump</title>
    
    <link rel="stylesheet" href="css/style.css">
</head>
<body>

    <div class="game-container">
        
        <header class="hud-bar">
            <div class="player-info">
                <span class="label">JOGADOR:</span>
                <span class="value" id="hud-player-name">---</span>
            </div>
            <div class="difficulty-info">
                <span class="label">NÍVEL:</span>
                <span class="value" id="difficulty-display"></span>
            </div>
            <div class="score-info">
                <span class="label">PONTOS:</span>
                <span class="value" id="score-display">0</span>
            </div>
            <div class="coins-info">
                <span class="label">MOEDAS:</span>
                <span class="value" id="coins-display">0</span>
            </div>
            <div class="lives-info">
                <span class="label">VIDAS:</span>
                <span class="value" id="lives-display">1</span>
            </div>
        </header>

        
        <main class="game-board" id="game-board">
            <div class="camada montanha-fundo"  id="montanha1"></div>
            <div class="camada montanha-frente" id="montanha2"></div>
            <div class="camada chao" id="chao"></div>
            <img src="assets/clouds.png" class="clouds" alt="Nuvens">
            <img src="assets\Running-Pikachu-GIF.webp" class="personagem" alt="pikachu">
            <img src="assets/pedra.png"
                class="obstaculo"
                id="obstaculo"
                alt="Obstáculo">
            <div class="moeda" id="moeda"></div>
            
            <img src="assets/boss.png" class="boss" id="boss" alt="Boss">
            <img src="assets/ataqueBoss.png" class="ataque-boss" id="ataque-boss" alt="Ataque do Boss">
            <div class="item-boss" id="item-boss"></div>
            <span class="boss-vida" id="boss-vida"></span>
            <h1 class="mensagemBoss" id="mensagemBoss">O BOSS APARECEU!</h1>
            <span class="detalheBoss" id="detalheBoss">Colete os orbes azuis para derrotá-lo!</span>
            

            <div class="barra-cooldown" id="barra-cooldown">
            <div class="barra-cooldown-fill" id="barra-cooldown-fill"></div>
            </div>
            <img src="assets/raioSkillPikachu.png" class="raio-skill" id="raio-skill" alt="Raio">

            <img src="assets/marioStar.png" class="powerup" id="powerup" alt="Power-up">

            <div class="barra-poder" id="barra-poder">
                <div class="barra-poder-fill" id="barra-poder-fill"></div>
            </div>
            
            <span class="jump-tip" id="jump-tip">Pressione ESPAÇO ou clique para pular</span>
        </main>
    </div>
    
    <!-- 1. TELA DE INÍCIO / INSERIR NOME -->
     
   <div class="select-caracter" id="select-caracter">

        <h1 class="select-title">Selecione um jogador</h1>

        <button type="button" class="btnSelect" id="btn-pikachu">
            <img src="assets/Running-Pikachu-GIF.webp" alt="Pikachu">
            <p>Pikachu</p>
        </button>

        <button type="button" class="btnSelect" id="btn-mario">
            <img src="assets/mario.gif" alt="Mario">
            <p>Mario</p>
        </button>

        <h3 class="infoCharacterPikachu">Habilidade "Choque do Trovão": Dispara um raio nos obstáculos e nos chefes com um cooldown de 5 segundos</h3>
        <h3 class="infoCharacterMario">Habilidade "Pulo Duplo": Dá um segundo salto, podendo te dar vantagens contra ataques altos e ao pular os obstáculos</h3>

        <button type="button" class="btn btn-primary" id="btn-confirmar-personagem">
            CONFIRMAR
        </button>

    </div>

    <div class="select-caracter" id="loja">
        <h1 class="select-title">Loja de melhorias</h1>
        <p>Suas moedas: <span id="loja-moedas">0</span></p>

        <button type="button" class="btnSelect" id="btn-comprar-moeda">
            Moedas 1.5x mais - <span id="preco-moeda">30 moedas (0/3)</span>
        </button>

        <button type="button" class="btnSelect" id="btn-comprar-pulo">
            Pulo 1.2x mais alto - <span id="preco-pulo">30 moedas (0/3)</span>
        </button>

        <button type="button" class="btnSelect" id="btn-comprar-vida">
            ❤️ +1 coração de vida - <span id="preco-vida">30 moedas (0/3)</span>
        </button>



        <button type="button" class="btn btn-primary" id="btn-jogar-loja">JOGAR</button>
    </div>

    <div class="modal-overlay active" id="start-modal">
        <div class="modal-card">
            <div class="modal-header">
                <h1 class="game-title">MARIO JUMP</h1>
                <p class="game-subtitle">Corra, desvie dos canos e dispute o topo do ranking!</p>
            </div>

            <form class="start-form" id="start-form">
                <div class="input-group">
                    <label for="player-input">DIGITE SEU NOME:</label>
                    <input 
                        type="text" 
                        id="player-input" 
                        placeholder="Ex: Seu Nome" 
                        maxlength="30" 
                        required 
                        autocomplete="off"
                        autofocus
                    >
                </div>

                <div class="modal-actions">
                    <button type="submit" class="btn btn-primary" id="btn-start">INICIAR JOGO</button>
                    <button type="button" class="btn btn-secondary" id="btn-view-ranking">VER RANKING</button>
                </div>
            </form>

            <div class="server-status" id="server-status">
                <span class="status-dot online"></span> Conectado ao MySQL
            </div>
        </div>
        <div class="select-player-card">

        </div>
    </div>

    <!--  TELA DE GAME OVER & RANKING -->
    <div class="modal-overlay" id="gameover-modal">
        <div class="modal-card gameover-card">
            <div class="modal-header">
                <h2 class="gameover-title">GAME OVER</h2>
                <div class="final-score-box">
                    <div class="final-score-label">SUA PONTUAÇÃO</div>
                    <div class="final-score-num" id="final-score-value">0</div>
                    <div class="save-status" id="save-status-msg"></div>
                </div>
            </div>

            <!-- Tabela com o TOP 10 -->
            <div class="ranking-container">
                <h3 class="ranking-title">🏆 TOP 10 MELHORES PONTUAÇÕES</h3>
                <div class="table-wrapper">
                    <table class="ranking-table">
                        <thead>
                            <tr>
                                <th>POS</th>
                                <th>JOGADOR</th>
                                <th>PONTUAÇÃO</th>
                            </tr>
                        </thead>
                        <tbody id="ranking-body">
                            <?php if (!empty($rankingInicial)): ?>
                                <?php foreach ($rankingInicial as $i => $row): ?>
                                    <tr>
                                        <td class="ranking-pos">
                                            <?= $i === 0 ? '🥇 1º' : ($i === 1 ? '🥈 2º' : ($i === 2 ? '🥉 3º' : ($i + 1) . 'º')) ?>
                                        </td>
                                        <td><strong><?= htmlspecialchars($row['nome']) ?></strong></td>
                                        <td><?= (int)$row['pontos'] ?> pts</td>
                                    </tr>
                                <?php endforeach; ?>
                            <?php else: ?>
                                <tr>
                                    <td colspan="3" class="loading-cell">Nenhuma pontuação gravada ainda. Jogue para ser o 1º!</td>
                                </tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="modal-actions">
                <button type="button" class="btn btn-primary" id="btn-restart">JOGAR NOVAMENTE</button>
                <button type="button" class="btn btn-secondary" id="btn-change-player">TROCAR JOGADOR</button>
            </div>
        </div>
    </div>

   
    <script src="js/script.js" defer></script>
</body>
</html>
