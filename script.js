const canvasEl = document.querySelector("canvas");
const canvasCtx = document.canvasEl("2d");

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
      forma: peca[id],
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
        const y = this.peca.x + i + dy;

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
            if (v){
                //
                this.grid[y +i][x + j] = id;
            }
        });
    });

    //
    const linhas = this.limpar()
    
    //
    //
    this.pontos += linhas * 100;

    //
    this.novaPeca();
  },
};

jogo.iniciar();
