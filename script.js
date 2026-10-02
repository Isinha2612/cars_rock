let usuarioAtual = null;

function mudarTela(idTela) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    let telaAlvo = document.getElementById(idTela);
    if (telaAlvo) {
        telaAlvo.classList.add('active');
    }
}

function fazerLogin() {
    let userElem = document.getElementById('login-user');
    if (!userElem) return;

    let nome = userElem.value.trim();
    if (nome === "") {
        alert("Digite o nome do piloto para entrar!");
        return;
    }

    let dadosSalvos = localStorage.getItem('cars_rock_user_' + nome);
    if (dadosSalvos) {
        try {
            usuarioAtual = JSON.parse(dadosSalvos);
            if (usuarioAtual.recorde === undefined) usuarioAtual.recorde = 0;
        } catch (e) {
            usuarioAtual = criarNovoPerfil(nome);
        }
    } else {
        usuarioAtual = criarNovoPerfil(nome);
    }

    salvarProgresso();
    userElem.value = "";
    atualizarDadosMenu();
    mudarTela('menu-screen');
}

function criarNovoPerfil(nome) {
    return {
        user: nome,
        points: 0,
        money: 0,
        recorde: 0,
        fasesCompletas: 0,
        avatar: null,
        currentCar: "Fusca Metal",
        carsOwned: ["Fusca Metal"]
    };
}

window.onload = function() {
    let salvo = localStorage.getItem('cars_rock_current_session');
    if (salvo) {
        try {
            usuarioAtual = JSON.parse(salvo);
            if (usuarioAtual && usuarioAtual.user) {
                if (usuarioAtual.recorde === undefined) usuarioAtual.recorde = 0;
                atualizarDadosMenu();
                mudarTela('menu-screen');
                return;
            }
        } catch (e) {
            console.error(e);
        }
    }
    mudarTela('auth-screen');
};

function sairDaConta() {
    salvarProgresso();
    localStorage.removeItem('cars_rock_current_session');
    usuarioAtual = null;
    mudarTela('auth-screen');
}

function salvarProgresso() {
    if (!usuarioAtual) return;
    localStorage.setItem('cars_rock_user_' + usuarioAtual.user, JSON.stringify(usuarioAtual));
    localStorage.setItem('cars_rock_current_session', JSON.stringify(usuarioAtual));
}

function atualizarDadosMenu() {
    if (!usuarioAtual) return;
    
    let nameDisplay = document.getElementById('player-name-display');
    let pointsDisplay = document.getElementById('player-points');
    let moneyDisplay = document.getElementById('player-money');
    let carDisplay = document.getElementById('current-car-name');
    let recordDisplay = document.getElementById('player-record');

    if (nameDisplay) nameDisplay.innerText = usuarioAtual.user;
    if (pointsDisplay) pointsDisplay.innerText = usuarioAtual.points;
    if (moneyDisplay) moneyDisplay.innerText = `R$ ${usuarioAtual.money}`;
    if (carDisplay) carDisplay.innerText = usuarioAtual.currentCar;
    if (recordDisplay) recordDisplay.innerText = Math.floor(usuarioAtual.recorde || 0);

    let statusText = document.getElementById('avatar-status');
    let avatarImg = document.getElementById('profile-avatar');
    let avatarDefault = document.getElementById('avatar-default');

    if (usuarioAtual.avatar) {
        if (avatarImg) { avatarImg.src = usuarioAtual.avatar; avatarImg.style.display = 'block'; }
        if (avatarDefault) avatarDefault.style.display = 'none';
    } else {
        if (avatarImg) avatarImg.style.display = 'none';
        if (avatarDefault) avatarDefault.style.display = 'block';
    }

    if (statusText) {
        let container = document.getElementById('profile-avatar-container');
        if (usuarioAtual.fasesCompletas >= 3) {
            statusText.innerText = "Toque ou arraste para trocar foto!";
            if (container) {
                container.onclick = function() {
                    let fileInput = document.getElementById('upload-avatar');
                    if (fileInput) fileInput.click();
                };
            }
        } else {
            statusText.innerText = `Fase ${usuarioAtual.fasesCompletas}/3 para desbloquear foto`;
            if (container) {
                container.onclick = function() {
                    alert("Complete a Fase 3 nas partidas para desbloquear a troca de foto de perfil!");
                };
            }
        }
    }
}

function carregarFotoArquivo(input) {
    if (input.files && input.files[0]) {
        let reader = new FileReader();
        reader.onload = function (e) { salvarNovaFoto(e.target.result); };
        reader.readAsDataURL(input.files[0]);
    }
}

function permitirDrop(ev) { ev.preventDefault(); }

function soltarFoto(ev) {
    ev.preventDefault();
    if (usuarioAtual.fasesCompletas < 3) {
        alert("Complete a Fase 3 primeiro!");
        return;
    }
    if (ev.dataTransfer.files && ev.dataTransfer.files[0]) {
        let reader = new FileReader();
        reader.onload = function (e) { salvarNovaFoto(e.target.result); };
        reader.readAsDataURL(ev.dataTransfer.files[0]);
    }
}

function salvarNovaFoto(urlData) {
    usuarioAtual.avatar = urlData;
    salvarProgresso();
    atualizarDadosMenu();
    alert("Foto de perfil alterada com sucesso!");
}

function voltarMenu() {
    atualizarDadosMenu();
    mudarTela('menu-screen');
}

function abrirSelecaoDificuldade() {
    mudarTela('difficulty-screen');
}

// LOJA & COMPRAS COM CONFIRMAÇÃO
function gerarCarrosLoja() {
    let grid = document.getElementById('cars-grid');
    if (!grid) return;
    grid.innerHTML = '';
    let listaCarros = [{ nome: "Fusca Metal", emoji: "🚗", preco: 0, raro: false }];
    let nomesRock = ["Thunder", "Hellfire", "Vortex", "Iron", "Rebel", "Darkness", "Blaze", "Anarchy", "Heavy", "Rocker"];

    for (let i = 2; i <= 32; i++) {
        let ehRaro = i > 25;
        let preco = ehRaro ? Math.floor(Math.random() * 400000) + 100000 : Math.floor(Math.random() * 80000) + 10000;
        listaCarros.push({
            nome: `${nomesRock[i % nomesRock.length]} GT-${i}`,
            emoji: ehRaro ? "💎🏎️" : "🏎",
            preco: preco,
            raro: ehRaro
        });
    }

    listaCarros.forEach(carro => {
        let card = document.createElement('div');
        card.className = `car-card ${carro.raro ? 'rare' : ''}`;
        let possui = usuarioAtual.carsOwned.includes(carro.nome);
        let usando = usuarioAtual.currentCar === carro.nome;
        let botaoTexto = usando ? "USANDO" : (possui ? "SELECIONAR" : `COMPRAR (${carro.preco.toLocaleString()} pts)`);
        let botaoDisabled = usando ? "disabled style='background: #444; cursor: default;'" : "";

        card.innerHTML = `
            <div>
                <span style="font-size: 28px;">${carro.emoji}</span>
                <h3 style="font-size: 13px; color: ${carro.raro ? '#ffd700' : '#fff'};">${carro.nome}</h3>
                <p style="font-size: 11px; color: #aaa;">${carro.raro ? '⭐ RARO' : 'Comum'}</p>
                <p style="font-size: 11px; color: #ffcc00;">${carro.preco.toLocaleString()} pts</p>
            </div>
            <button class="rock-btn" ${botaoDisabled} onclick="tentarComprarOuSelecionar('${carro.nome}', ${carro.preco})">${botaoTexto}</button>
        `;
        grid.appendChild(card);
    });
}

function abrirLoja() {
    let pointsElem = document.getElementById('store-points');
    if (pointsElem) pointsElem.innerText = usuarioAtual.points.toLocaleString();
    gerarCarrosLoja();
    mudarTela('store-screen');
}

function tentarComprarOuSelecionar(nomeCarro, preco) {
    if (usuarioAtual.carsOwned.includes(nomeCarro)) {
        usuarioAtual.currentCar = nomeCarro;
        salvarProgresso();
        abrirLoja();
        alert(`Carro ${nomeCarro} selecionado para a pista!`);
    } else {
        if (usuarioAtual.points < preco) {
            alert("❌ Você possui pontos insuficientes para comprar este carro!");
        } else {
            let modal = document.getElementById('confirm-modal');
            let text = document.getElementById('confirm-text');
            let yesBtn = document.getElementById('yes-confirm-btn');

            if (text) text.innerText = `Deseja realmente comprar o carro ${nomeCarro} por ${preco.toLocaleString()} pontos?`;
            if (modal) modal.classList.add('active');

            if (yesBtn) {
                yesBtn.onclick = function() {
                    usuarioAtual.points -= preco;
                    usuarioAtual.carsOwned.push(nomeCarro);
                    usuarioAtual.currentCar = nomeCarro;
                    salvarProgresso();
                    fecharModalConfirmacao();
                    abrirLoja();
                    alert(`🎉 Compra realizada com sucesso! Você agora pilota o ${nomeCarro}.`);
                };
            }
        }
    }
}

function fecharModalConfirmacao() {
    let modal = document.getElementById('confirm-modal');
    if (modal) modal.classList.remove('active');
}

// ==================== MECÂNICA DO JOGO ====================
let gameLoopInterval = null;
let spawnInterval = null;
let pointsInterval = null;
let pontosTimer = null;
let playerLane = 1; 
const lanesX = [50, 155, 260]; 
let gameData = { lives: 3, points: 0, distance: 0, speed: 6, meta100alcancada: false, meta300alcancada: false, meta500alcancada: false };
let enemyCars = [];
let jogoRodando = false;
let tempoSpawnAtual = 1000;

function iniciarJogo(dif) {
    gameData.lives = 3;
    gameData.points = 0;
    gameData.distance = 0;
    gameData.meta100alcancada = false;
    gameData.meta300alcancada = false;
    gameData.meta500alcancada = false;
    
    // Nível Médio agora está bem mais rápido e desafiador!
    if (dif === 'facil') {
        gameData.speed = 6;
        tempoSpawnAtual = 1200;
    } else if (dif === 'medio') {
        gameData.speed = 13; 
        tempoSpawnAtual = 650; 
    } else {
        gameData.speed = 18; 
        tempoSpawnAtual = 450; 
    }

    playerLane = 1;
    enemyCars = [];
    
    let pCar = document.getElementById('player-car');
    if (pCar) {
        pCar.innerText = usuarioAtual.currentCar.includes("Fusca") ? "🚗" : "🏎️";
        pCar.style.left = lanesX[playerLane] + 'px';
    }

    document.querySelectorAll('.enemy-car').forEach(e => e.remove());

    mudarTela('game-screen');
    atualizarHUD();

    jogoRodando = true;
    window.addEventListener('keydown', controlarTeclado);

    gameLoopInterval = setInterval(atualizarLogicaJogo, 20);

    // Quilômetros crescendo e checando as metas de 100km, 300km e 500km
    pointsInterval = setInterval(() => {
        if (!jogoRodando) return;
        gameData.distance += 0.5;

        let distInt = Math.floor(gameData.distance);

        if (distInt >= 100 && !gameData.meta100alcancada) {
            gameData.meta100alcancada = true;
            gameData.points += 200;
            alert("🚀 METADE DE CAMINHO! Você atingiu 100 km e ganhou +200 pontos!");
        }

        if (distInt >= 300 && !gameData.meta300alcancada) {
            gameData.meta300alcancada = true;
            gameData.points += 400;
            alert("🔥 VELOCIDADE PURA! Você atingiu 300 km e ganhou +400 pontos!");
        }

        if (distInt >= 500 && !gameData.meta500alcancada) {
            gameData.meta500alcancada = true;
            gameData.points += 1000;
            alert("🏆 LENDÁRIO! Você chegou a 500 km e ganhou o super bônus de +1000 pontos! 🎸");
        }
    }, 1000);

    // 5 pontos a cada 10 segundos
    pontosTimer = setInterval(() => {
        if (!jogoRodando) return;
        gameData.points += 5;
        atualizarHUD();
    }, 10000);

    spawnInterval = setInterval(gerarCarroInimigo, tempoSpawnAtual);
}

function controlarTeclado(e) {
    if (!jogoRodando) return;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        if (playerLane > 0) playerLane--;
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (playerLane < 2) playerLane++;
    }
    let pCar = document.getElementById('player-car');
    if (pCar) {
        pCar.style.left = lanesX[playerLane] + 'px';
    }
}

function gerarCarroInimigo() {
    if (!jogoRodando) return;
    let laneAleatoria = Math.floor(Math.random() * 3);
    let emojisInimigos = ["🚓", "🚕", "🚐", "🚚", "🚙", "🏎️️"];
    let emojiEscolhido = emojisInimigos[Math.floor(Math.random() * emojisInimigos.length)];

    let trackContainer = document.getElementById('track-container');
    if (!trackContainer) return;

    let enemyElem = document.createElement('div');
    enemyElem.className = 'enemy-car';
    enemyElem.innerText = emojiEscolhido;
    enemyElem.style.left = lanesX[laneAleatoria] + 'px';
    enemyElem.style.top = '-60px';
    
    trackContainer.appendChild(enemyElem);

    enemyCars.push({
        element: enemyElem,
        lane: laneAleatoria,
        y: -60
    });
}

function atualizarLogicaJogo() {
    if (!jogoRodando) return;

    atualizarHUD();

    for (let i = enemyCars.length - 1; i >= 0; i--) {
        let enemy = enemyCars[i];
        enemy.y += gameData.speed;
        enemy.element.style.top = enemy.y + 'px';

        let trackHeight = document.getElementById('track-container').clientHeight;
        let playerYPos = trackHeight - 90; 

        if (enemy.y >= playerYPos - 40 && enemy.y <= playerYPos + 30) {
            if (enemy.lane === playerLane) {
                gameData.lives--;
                enemy.element.remove();
                enemyCars.splice(i, 1);
                
                if (gameData.lives <= 0) {
                    fimDeJogo();
                    return;
                }
                continue;
            }
        }

        if (enemy.y > trackHeight) {
            enemy.element.remove();
            enemyCars.splice(i, 1);
        }
    }
}

function atualizarHUD() {
    let livesStr = "";
    for(let i=0; i<gameData.lives; i++) livesStr += "❤️ ";
    
    let lDisp = document.getElementById('lives-display');
    let dDisp = document.getElementById('distance-display');
    let pDisp = document.getElementById('game-points');

    if (lDisp) lDisp.innerText = livesStr;
    if (dDisp) dDisp.innerText = Math.floor(gameData.distance);
    if (pDisp) pDisp.innerText = gameData.points;
}

function finalizarPartidaGeral() {
    let distAtual = Math.floor(gameData.distance);
    if (!usuarioAtual.recorde || distAtual > usuarioAtual.recorde) {
        usuarioAtual.recorde = distAtual;
    }

    usuarioAtual.points += gameData.points;
    usuarioAtual.money += Math.floor(gameData.points * 10);
    if (usuarioAtual.fasesCompletas < 3) usuarioAtual.fasesCompletas += 1;

    salvarProgresso();
}

function fimDeJogo() {
    pararIntervalos();
    let distAtual = Math.floor(gameData.distance);
    finalizarPartidaGeral();
    alert(`💥 BATIDA! Fim de jogo!\nVocê acumulou ${gameData.points} pontos e correu ${distAtual} km!`);
    voltarMenu();
}

function pararJogo() {
    pararIntervalos();
    let distAtual = Math.floor(gameData.distance);
    let pontosGanhos = gameData.points;
    finalizarPartidaGeral();
    alert(`Partida encerrada! Você resgatou ${pontosGanhos} pontos e correu ${distAtual} km!`);
    voltarMenu();
}

function pararIntervalos() {
    jogoRodando = false;
    clearInterval(gameLoopInterval);
    clearInterval(spawnInterval);
    clearInterval(pointsInterval);
    clearInterval(pontosTimer);
    window.removeEventListener('keydown', controlarTeclado);
    document.querySelectorAll('.enemy-car').forEach(e => e.remove());
}