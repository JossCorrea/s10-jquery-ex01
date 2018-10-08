MINES = 40;
HEIGHT = 20; //Número de linhas
WIDTH = 15; //Número de colunas

//Considerando que o campo minado pode ser entendido como uma matriz aij com 20 linhas (height) e 15 colunas(width)

//Função que gera 40 pares de índices correspondentes às posições aleatórias das bombas na matriz
function getUniqueRandomIndexesIn2DArray(table, indexes) {
    indexes = indexes ? indexes : [];
    for (var i = indexes.length; i < MINES; i++) {
        var random_cell = Math.floor(Math.random() * WIDTH); //número de colunas (j)
        var random_row = Math.floor(Math.random() * HEIGHT); //número de linhas (i)
        for (var j = 0; j < indexes.length; j++) {
            if (indexes[j][0] === random_cell &&
                indexes[j][1] === random_row) {
                return arguments.callee(table, indexes); //
            }
        }
        indexes.push([random_row,random_cell]);  //BUG 1: as posições de random_row e random_cell estavam invertidas pois primeiramente informamos a "coordenada" da linha e posteriormente a "coordenada" da coluna.
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

// Cria uma tabela na estrutura do HTML correspondente à matriz a ser apresentada na tela
var field_matrix = [];   //Cria um array denominado field_matrix
var field = $("#field table"); //Cria uma div com o id = field contendo uma tabela na estrutura do HTML
for (var i = 0; i < HEIGHT; i++) { //Intera por todas as linhas da matriz ...
    var row_vector = [];   //Cria um array vazio chamado row_vector
    var row = $("<tr>");   //Cria um elemento <tr> correspondente a cada linha da tabela no HTML
    for (var j = 0; j < WIDTH; j++) { //Intera por todas as colunas da matriz ...
        var mine = $("<td>"); //Cria um elemento <td> correspondente a célula de cada coluna 
        mine.data("mines", 0); //Cria um atributo denominado "mines" com o valor igual a zero para cada célula mine

        row.append(mine); //Insere cada elemento mine na linha correspondente do HTML
        row_vector.push(mine) //Faz o mesmo para o array row_vector
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