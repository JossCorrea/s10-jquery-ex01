// Ao carregar
const LEVEL = [[8,10,"260px"],[16,40,"480px"],[24,99,"660px"]]; // Cria lista contendo [tamanho do campo (altura/largura),número de minas, tamanho da janela] correspondente a cada nível de dificuldade. Índice 0 = Iniciante, Índice 1 = Intermediário e Índice 2 = Avançado.

LEVEL_ATUAL = 0; //Define o nível inicial como Iniciante
campo_minado(LEVEL_ATUAL) //Carrega o jogo no nível inicial
$(".level").css("display","none"); //Oculta a lista de opções

// Configuração do estilo da lista ao passar o mouse no item Jogo
$(".window-controls").on( "mouseover", function(event){
    event.preventDefault()
    $(".level").css("display", "block");
    $(".level").css("background-color", "#d6cfc7");
    $(".level").css("position", "fixed");
    $(".level").css("z-index", "999");
    $(".options").css("padding","10px");
    $(".level").css("list-style","none");
})

//Oculta o menu ao retirar o mouse
$(".window-controls").on( "mouseout", function(event){
    event.preventDefault()
    $(".level").css("display", "none");
})

//Função para pegar o id do nível selecionado e atualizar a variavel LEVEL_ATUAL selecionado pelo usuário
function handler( event ) {
    var target = $(event.target);
    if (target.is( "li" ) ) {
        $(".level").css("display", "none");
        LEVEL_ATUAL = target[0].id;
        resetAll(event)
    }
  }
$( ".options" ).click(handler); //Adicionar evento de click nos itens da lista

$("#reset").click(resetAll)

function resetAll(event){
    if ($("#reset").hasClass("game-over")){
        $("#reset").removeClass("game-over")
    }else if ($("#reset").hasClass("wow")){
        $("#reset").removeClass("wow")
    }else if ($("#reset").hasClass("winner")){
        $("#reset").removeClass("winner")
    }                                     //$(this).removeClass("game-over wow winner")
    clearInterval(TIMER);
    $("#field table").empty(); //Mesmo que $("#field table").html("")
    $("#timer").text(""); //Ou $("#timer","#mines").html("");()
    $("#mines").text("");
    campo_minado(LEVEL_ATUAL);
}

//Considerando que o campo minado pode ser entendido como uma matriz aij com 20 linhas (height) e 15 colunas(width)

//Função que gera 40 pares de índices correspondentes às posições aleatórias das bombas na matriz
// table.empty();

function campo_minado(level_selected){
    // level_selected = level_selected?:level_selected:0;

    MINES = LEVEL[level_selected][1];
    HEIGHT = LEVEL[level_selected][0];
    WIDTH = LEVEL[level_selected][0]
    TIMER = false;
    $(".window").css("width",LEVEL[level_selected][2])

    function getUniqueRandomIndexesIn2DArray(table, indexes) {
        indexes = indexes ? indexes : [];
        for (var i = indexes.length; i < MINES; i++) {
            var random_cell = Math.floor(Math.random() * WIDTH);
            var random_row = Math.floor(Math.random() *  HEIGHT);
            for (var j = 0; j < indexes.length; j++) {
                if (indexes[j][0] === random_row &&
                    indexes[j][1] === random_cell) {
                    return arguments.callee(table, indexes);
                }
            }
            indexes.push([random_row, random_cell]);
        }
        return indexes;   
    }

    //Função que filtra os elementos que estão fora da matriz que é apresentada na tela
    function getAdjacentCellIndexes(x, y) {
        return $.grep([
            [ x - 1, y - 1 ],
            [ x, y - 1 ],
            [ x + 1, y - 1 ],
            [ x - 1, y ],
            [ x + 1, y ],
            [ x - 1, y + 1 ],
            [ x, y + 1 ],
            [ x + 1, y + 1 ]
        ], function (element) {
            return element[0] >= 0 && element[1] >= 0
                && element[1] < WIDTH && element[0] < HEIGHT //BUG2: O element[0] corresponde ao índice i, e precisamos verificar se ele está no intervalo de 0 até o número máximo de linhas da matriz (heigth = 20). O element[1] corresponde ao índice j da matriz e varia de 0 até o número máximo de colunas (width =15).
        });
    }

    var field_matrix = [];
    var field = $("#field table");
    var counter = 0;
    for (var i = 0; i < HEIGHT; i++) {
        var row_vector = [];
        var row = $("<tr>");
        for (var j = 0; j < WIDTH; j++) {
            var mine = $("<td>");
            mine.data("mines", 0);
            var button = $("<div>");
            button.addClass("button");
            button.data("coordinates", [i, j]);//Inverti para ordem linha/celula
            button.contextmenu(function () {
                return false;
            });

            button.mousedown(function(event) {
                if (!TIMER) {
                    TIMER = setInterval(function () {  //Recebe uma função e um intervalo de tempo para executar a função (set Interval roda indefinidamente até você alterar o intervalo)
                        counter++;
                        $("#timer").text(counter);
                    }, 1000);
                }
                if (event.which === 3) {
                    $(this).toggleClass("red-flag");
                    $("#mines").text($(".red-flag").length);
                } else {
                    $("#reset").addClass("wow");
                }
            });

            button.mouseup(function () {
                $("#reset").removeClass("wow");
                if (!$(this).hasClass("red-flag")) {
                    if ($(this).parent().hasClass("mine")) {
                        $("td .button").each(function (index, button) {
                            button.remove();
                        })
                        $("#reset").addClass("game-over");
                        clearInterval(TIMER);
                    } else if ($(this).parent().data("mines") > 0) {
                        $(this).remove();
                    } else if ($(this).parent().data("mines") === 0) {
                        var coordinates = $(this).data("coordinates");
                        $(this).remove();
                        (function (x, y) {
                            var adjacent_cells = getAdjacentCellIndexes(x, y);
                            for (var k = 0; k < adjacent_cells.length; k++) {
                                var x = adjacent_cells[k][0];
                                var y = adjacent_cells[k][1];
                                var cell = $(field_matrix[x][y]); //Corrigido para linha/celula
                                var button = cell.children($(".button"));
                                if (button.length > 0) {
                                    button.remove();
                                    if (cell.data("mines") === 0) {
                                        arguments.callee(x, y);
                                    }
                                }
                            }
                        })(coordinates[0], coordinates[1]);
                    }

                    if ($("td .button").length === MINES) {
                        $("#reset").addClass("winner");
                        clearInterval(TIMER);
                    }

                }
            })

            mine.append(button);
            row.append(mine);
            row_vector.push(mine)
        }
        field.append(row); //Insere a linha com os elementos na estrutura do HTML
        field_matrix.push(row_vector); //Insere a linha criada no array correspondente à matriz
    }

     


    //Adiciona a classe "mine" para cada elemento da matriz que corresponde à uma bomba
    var mine_indexes = getUniqueRandomIndexesIn2DArray(field_matrix); //Pega todos os índices do array que contém as posições das bombas
    $.each(mine_indexes, function(index, coordinates) { //para cada par de índices
        var x = coordinates[0]; //Pega o primeiro elemento (i) da coordenada da posição da bomba na matriz
        var y = coordinates[1];//Pega o segundo  elemento (j) da coordenada da posição da bomba na matriz
        var mine = $(field_matrix[x][y]);
        mine.addClass("mine"); //Adiciona a classe aqui!
    });

    $.each(mine_indexes, function (index, coordinates) { //para cada par de índices
        var adjacent_cells = getAdjacentCellIndexes(coordinates[0], coordinates[1]); // Avalia a quantidade de bombas que existem no entorno, chamando a função criada anteriormente. BUG 3: Corrigida a posição dos índices para a ordem i, j
        $.each(adjacent_cells, function(index, coordinates) { //Itera por todas as bombas
            var x = coordinates[0];
            var y = coordinates[1];
            var cell = $(field_matrix[x][y]);
            console.log(cell)
            if (!cell.hasClass("mine")) {
                var num_mines = cell.data("mines") + 1; //Incrementa os valores dos atributos data (criado e zerado anteriorimente) em cada célula do entorno de cada bomba
                cell.data("mines", num_mines);
                switch (num_mines) { //Altera o estilo/cor dos elementos dos números que serão mostrados tela
                    case 1:
                        cell.css("color", "blue"); 
                        break;
                    case 2:
                        cell.css("color", "green");
                        break;
                    case 3:
                        cell.css("color", "red");
                        break;
                    case 4:
                        cell.css("color", "navy");
                        break;
                    case 5:
                        cell.css("color", "maroon");
                        break;
                    case 6:
                        cell.css("color", "teal");
                        break;
                    case 7:
                        cell.css("color", "DarkMagenta");
                        break;
                    case 8:
                        cell.css("color", "black");
                        break;
                }
            }
        })
    });

    //Função para mostrar os valores do atributo data na tabela(HTML)
    $.each(field_matrix, function(index, row) {
        $.each(row, function(index, cell) {
            var number = $(cell).data("mines");
            if (number > 0) {
                $(cell).append(number);
            }
        });
    });

}
