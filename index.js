var fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const {promisify} = require('util')
const readFile = promisify(fs.readFile)
const readdir = promisify(fs.readdir)

readdir('in/', async function(err, filenames) {
    
    var json = await extrairDiretorio(filenames);

    fs.writeFile("out/dados.json", JSON.stringify(json), function(erro) {

        if(erro) {
            throw erro;
        }
    
        console.log("Arquivo salvo");
    }); 

    // console.log(a)

})

async function extrairDiretorio(items) {
    return await Promise.all(items.map( async(i) => {
        const res = await extrairHTML(i);
        console.log('--->', i);
        return res
     }))
}

function extrairHTML(filename) {
    return new Promise((resolve, reject)=>{

        readFile('in/' + filename, 'utf-8', function(err, content) {

            const dom = new JSDOM(
                content,
            { includeNodeLocations: true }
            );
            
            const document = dom.window.document;
            
            const pathTable = "body > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(2) > table:nth-child(7)"
            const tbody = document.querySelector(`${pathTable} > tbody`);
            const head = tbody.querySelector('.rotulo');
            const elements = document.querySelectorAll(`${pathTable} > tbody > .conteudoTexto`);
            
            const qtdColumn = head.childElementCount;
            const qtdRow = elements.length;
        
            let tituloTabela = tbody.querySelector('.nome_tipo_curso > td').textContent;
        
            const dados = new Array(qtdRow)
        
            // Iterando as linhas
            for (let indexRow = 0; indexRow < qtdRow; indexRow++) {
                const row = elements.item(indexRow).children;
                dados[indexRow] = {}
        
                // Iterando as colunas
                for (let indexColumn = 0; indexColumn < qtdColumn; indexColumn++) {
                    const element = row.item(indexColumn);
                        
                    // Aplicavel somente quando a estrutura da tabela for do perfil de professor (com 18 colunas)
                    if (qtdColumn == 18) {
                        var nomeColumn = `${indexColumn}`
        
                        switch (indexColumn) {
                            case 0:
                                nomeColumn = "componenteCurricular"
                                break;
                            case 1:
                                nomeColumn = "cargaHoraria"
                                break;
                            case 2:
                                nomeColumn = "turma"
                                break;
                            case 3:
                                nomeColumn = "totalFaltas"
                                break;
                            case 4:
                                nomeColumn = "mediaFinal"
                                break;
                            case 5:
                                nomeColumn = "unidadeUm"
                                break;
                            case 6:
                                nomeColumn = "faltaUnidadeUm"
                                break;
                            case 7:
                                nomeColumn = "unidadeDois"
                                break;
                            case 8:
                                nomeColumn = "faltaUnidadeDois"
                                break;
                            case 9:
                                nomeColumn = "unidadeTres"
                                break;
                            case 10:
                                nomeColumn = "faltaUnidadeTres"
                                break;
                            case 11:
                                nomeColumn = "unidadeQuatro"
                                break;
                            case 12:
                                nomeColumn = "faltaUnidadeQuatro"
                                break;
                            case 13:
                                nomeColumn = "mediaParcial"
                                break;
                            case 14:
                                nomeColumn = "exameFinal"
                                break;
                            case 15:
                                nomeColumn = "f"
                                break;
                            case 16:
                                nomeColumn = "mediaFinal"
                                break;
                            case 17:
                                nomeColumn = "situacao"
                                break;
                            default:
                                break;
                        }
        
                        dados[indexRow][`${nomeColumn}`] = element.textContent.trim()
                    } else {
                        dados[indexRow][`${head.children.item(indexColumn).textContent.trim()}_${indexColumn}`] = element.textContent.trim()
                    }
                    
                }
            }

            resolve({
                informacoes: {
                    informacaoComponenteCurricular: tituloTabela,
                    identificador: document.querySelector('body > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(2) > table:nth-child(4) > tbody > tr > td > div > font').textContent.trim()
                },
                componentesCurriculares: dados
            })

          })


    //   setTimeout(()=>{
    //     resolve("Resolved" + filename)
    //   },filename);



    })
}
