const canvasEl = document.querySelector("canvas");
const canvasCtx = canvasEl.getContext("2d");

// Configurações do Jogo
const tamBloco = 30;

// Quantidade de colunas no Tetris (padrão é 10)
const cols = 10;

// Quantidade de linhas no Tetris (padrão é 20)
const rows = 20;

// Area lateral (mostra pontuação e prox peça)
canvasEl.width = cols * tamBloco + 140; // 140px = Painel lateral
canvasEl.height = rows * tamBloco;

// Peças Tetris:
// Cada peça é representada por uma matriz
// O valor 1 significa que existe bloco naquela posição
// O valor 0 significa que espaço vazio dentro da forma
const pecas = [
  // Peça I
  [[1, 1, 1, 1]],

  // Peça J
  [
    [1, 0, 0],
    [1, 1, 1],
  ],

  // Peça L
  [
    [0, 0, 1],
    [1, 1, 1],
  ],

  // Peça S
  [
    [0, 1, 1],
    [1, 1, 0],
  ],

  // Peça O
  [
    [1, 1],
    [1, 1],
  ],

  // Peça T
  [
    [1, 1, 1],
    [0, 1, 0],
  ],

  //Peça Z
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
];

// Cada peça recebe uma cor
const cores = ["cyan", "blue", "orange", "yellow", "green", "purple", "red"];

// Funções auxiliares
// Gera um número aleatório entre 0 e 1
const rand = (n) => Math.floor(Math.random() * n);

// Criar um grid vazio
// O grid é uma matriz de 10x10 preenchida com -1
// -1 significa que a célula está vazia
const criarGrid = () =>
  Array.from({ length: rows }, () => Array(cols).fill(-1));

const jogo = {
  gameOver: false, // Indica se o jogo acabou

  // grid = matriz principal do jogo, onde as peças fixadas ficam guardada
  grid: criarGrid(),

  // peca = peças que esta caindo nesse momento
  peca: null,

  // proxima = indice da próxima peça que sera criada
  proxima: rand(pecas.length),

  // pontos = pontuação acumulada do jogador
  pontos: 0,

  // Inicialização do Jogo:
  iniciar() {
    // Reinicia o estado de Game Over
    this.gameOver = false;

    // Limpa o grid para começar do zero
    this.grid = criarGrid();

    // Zera a pontuação
    this.pontos = 0;

    // Cria a primeira peça
    this.novaPeca();
  },

  // Criação de nova peça:
  novaPeca() {
    const id = this.proxima;
    
    this.peca = {
      id,
      forma: pecas[id],
      x: rand(cols - pecas[id][0].length),
      y: 0,
    };
    this.proxima = rand(pecas.length);

    // verifica game over
    // Se a peça já nasce colidindo com algo, acabou o jogo
    if (!this.pode(0, 0)) {
      this.gameOver = true;
    }
  },

  // Verificação de movimento
  // Essa função testa se a peça pode se mover para a posição desejada
  // dx = deslocamento na horizontal
  // dy = deslocamento na vertical
  // forma = matriz da peça
  pode(dx, dy, forma = this.peca.forma) {
    // every() percorre todos os elementos e retorna true apenas de todos forem verdadeiros
    return forma.every((linha, i) =>
      linha.every((v, j) => {
        // Se o valor é 0, não existe bloco naquela posição, então não precisa validar
        if (!v) return true;

        // Calcula a posição real do grid
        // this.peca.x + j = posição horizontal da célula da matriz
        // this.peca.y + i = posição vertical da célula da matriz
        // dx/dy = deslocamento que estamos testando
        const x = this.peca.x + j + dx;
        const y = this.peca.y + i + dy;

        // Limite das paredes e chão
        if (x < 0 || x >= cols || y >= rows) return false;
        // Se a célula do grid estiver preenchida, também limita
        return y < 0 || this.grid[y][x] === -1;
      }),
    );
  },

  // Movimenta a peça:
  mover(dx, dy) {
    // Se o jogo acabar, não movimenta mais
    if (this.gameOver) return;
    // Se a posição for válida, então move a peça
    if (this.pode(dx, dy)) {
      this.peca.x += dx;
      this.peca.y += dy;
    } else if (dy === 1) {
      this.fixar();
    }
  },

  // Rotação da peça:
  girar() {
    const f = this.peca.forma;

    // A rotação é feira convertendo as linhas em colunas
    // Precisamos girar a peça em 90 graus no sentido horário

    // f[0].map((_, i)) -> percorre as colunas
    // f.map(l => l[i]) -> pega o valor da coluna i em cada linha
    // .reverse() inverte a ordem, completando a rotação
    const nova = f[0].map((_, i) => f.map((l) => l[i]).reverse());

    // Só se aplica a rotação se nova forma couber
    if (this.pode(0, 0, nova)) {
      this.peca.forma = nova;
    }
  },

  // Fixar peça no grid:
  fixar() {
    const { forma, x, y, id } = this.peca;

    //
    //
    forma.forEach((linha, i) => {
      linha.forEach((v, j) => {
        if (v) {
          //
          this.grid[y + i][x + j] = id;
        }
      });
    });

    //
    const linhas = this.limpar();

    // Pontuação:
    // Cada linha removida vale 100 pontos
    this.pontos += linhas * 100;

    // Cria a prox peça
    this.novaPeca();
  },

  limpar() {
    let removidas = 0;

    this.grid = this.grid.filter((linha) => {
      // every(c => c !== -1) significa que todas as células forem diferentes de -1
      // Então, signigica linha completa
      if (linha.every((c) => c !== -1)) {
        removidas++;
        return false; // Remove a linha do array
      }
      return true; // Mantém a linha
    });

    // Depois de remover linhas, precisamos manter o grid
    // Então adicionamos linhas novas no topo
    while (this.grid.length < rows) {
      this.grid.unshift(Array(cols).fill(-1));
    }
    return removidas;
  },
};

// Desenha na tela:
// Desenha um bloco individual no canvas
function bloco(x, y, cor) {
  canvasCtx.fillStyle = cor;

  // O "+1" cria um pequeno espaço entre os bloco
  // "tamBloco - 2" pq o bloco fica 1px menor de cada lado
  canvasCtx.fillRect(x + 1, y + 1, tamBloco - 2, tamBloco - 2);
}

function desenhar() {
  if (!jogo.peca) return;

  // Fundo do jogo
  canvasCtx.fillStyle = "#222";
  canvasCtx.fillRect(0, 0, canvasEl.width, canvasEl.height);

  // Desenha o grid:
  jogo.grid.forEach((linha, i) => {
    linha.forEach((v, j) => {
      bloco(j * tamBloco, i * tamBloco, v === -1 ? "#333" : cores[v]);
    });
  });

  // Desenha a peça atual:
  jogo.peca.forma.forEach((linha, i) => {
    linha.forEach((v, j) => {
      if (v) {
        bloco(
          (jogo.peca.x + j) * tamBloco,
          (jogo.peca.y + i) * tamBloco,
          cores[jogo.peca.id],
        );
      }
    });
  });

  // Desenhar prox peça:
  const p = pecas[jogo.proxima];
  p.forEach((linha, i) => {
    linha.forEach((v, j) => {
      if (v) {
        bloco(
          cols * tamBloco + 20 + j * tamBloco,
          60 + i * tamBloco,
          cores[jogo.proxima],
        );
      }
    });
  });

  // Texto da interface:
  canvasCtx.fillStyle = "#fff";
  canvasCtx.font = "16px Arial";
  canvasCtx.textAlign = "left";

  // Mostra a pontuação
  canvasCtx.fillText("Pontos: " + jogo.pontos, cols * tamBloco + 10, 30);

  // Título
  canvasCtx.fillText("Próxima peça: ", cols * tamBloco + 10, 50);

  // Tela Gamer Over:
  if (jogo.gameOver) {
    canvasCtx.fillStyle = "#000";
    canvasCtx.fillRect(0, 0, canvasEl.width, canvasEl.height);

    canvasCtx.fillStyle = "red";
    canvasCtx.textAlign = "center";
    canvasCtx.font = "30px Arial";
    canvasCtx.fillText("GAME OVER", canvasEl.width / 2, canvasEl.height / 2);

    canvasCtx.font = "16px Arial";
    canvasCtx.fillText(
      "Pressione 'R' para reiniciar",
      canvasEl.width / 2,
      canvasEl.width / 2 + 30,
    );
  }
}

// Controles do jogo:
document.addEventListener("keydown", (e) => {
  // Reiniciar o jogo
  if (e.key === "r") {
    jogo.iniciar(0);
    return;
  }
  // Mover para esquerda
  if (e.key === "ArrowLeft") jogo.mover(-1, 0);
  // Mover para direita
  if (e.key === "ArrowRight") jogo.mover(1, 0);
  // Mover para baixo
  if (e.key === "ArrowDown") jogo.mover(0, 1);
  // Rotacionar
  if (e.key === "ArrowUp") jogo.girar();
});

// Loop principal do jogo:
let tempo = 0;
function loop() {
  tempo++;

  if (tempo % 30 === 0) {
    jogo.mover(0, 1);
  }

  // Desenha tudo na tela
  desenhar();

  // Pede para o navegador chamar esta função de novo no próximo frame
  requestAnimationFrame(loop);
}

// Inicio do jogo:
jogo.iniciar();
loop();
