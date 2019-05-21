const { Hour } = require('../models')
const sequelize = require('sequelize')
const Op = require('../models').Sequelize.Op
const Shell = require('node-powershell')
const Path = require('path')

const ps = new Shell({
  executionPolicy: 'Bypass',
  noProfile: true
})

class HourController {
  create (req, res) {
    return res.render('auth/sethour')
  }

  /**
   * Função que seta o valor do funcionário no AD
   * @param {*} req
   * @param {*} res
   */
  async setHour (req, res) {
    // Recebemos os parâmetros POST
    var { usuario, horaIni, horaFim, diaSemana } = req.body
    horaFim = horaFim - 1
    /**
     * Criamos a instrução que irá trazer o valor da hora solicitada
     */

    var valueHour
    if (horaIni > 0 && horaFim > 0) {
      valueHour = await Hour.findAll({
        attributes: [
          'byte',
          'dia_semana',
          [sequelize.fn('sum', sequelize.col('valor')), 'soma']
        ],
        where: {
          dia_semana: diaSemana,
          hora: {
            [Op.between]: [horaIni, horaFim]
          }
        },
        group: ['byte']
      })
    }

    /**
     * Capturamos as informações do usuário atual do AD
     */
    ps.addCommand(
      `${Path.resolve('src', 'scripts', 'script_getUserHour.ps1')} ${usuario}`
    )
    ps.invoke()
      .then(output => {
        var retorno = output.split(' ')
        var paramIni
        var paramFim
        if (diaSemana === 1) {
          paramIni = 0
          paramFim = 2
        } else if (diaSemana === 2) {
          paramIni = 3
          paramFim = 5
        } else if (diaSemana === 3) {
          paramIni = 6
          paramFim = 8
        } else if (diaSemana === 4) {
          paramIni = 9
          paramFim = 11
        } else if (diaSemana === 5) {
          paramIni = 12
          paramFim = 14
        } else if (diaSemana === 6) {
          paramIni = 15
          paramFim = 17
        } else if (diaSemana === 7) {
          paramIni = 18
          paramFim = 20
        }

        var cont = 0
        for (paramIni; paramIni <= paramFim; paramIni++) {
          if (cont === 0) {
            if (paramIni === 18) {
              retorno[0] = '0'
            } else {
              retorno[paramIni + 3] = '0'
            }
          } else {
            retorno[paramIni] = '0'
          }
          cont++
        }

        // console.log(`Valor do retorno: ${retorno}`)
        var arrayString = '' // Array de string que vamos passar para o script powershell
        var byte = 1 // Variável utilizada para saber em qual byte estamos no for
        var param // Variável utilizada para criar o segundo for
        var dia = 1 // Variável utilizada para saber em que dia da semana estamos
        var virgula // Variável utilizada para inserir vírgulas no arrayString
        // console.log(`Array antes de modificar: ${retorno}`)
        for (var i = 0; i < retorno.length; i++) {
          byte = 1 // Sempre o segundo for iniciará com o byte sendo 1
          param = i + 3 // Sempre o parametro do segundo for será o valor de i + 3
          for (var y = i; y < param; y++) {
            if (dia === diaSemana) {
              // Se o dia atual for igual o dia informado no POST
              for (var x in valueHour) {
                // Criamos outro for com os valores que vieram do banco de dados
                if (valueHour[x].dataValues.byte === byte) {
                  // Se o Byte do dia for igual ao do banco de dados
                  if (horaFim > 20 && byte === 1) {
                    // console.log('A hora fim é maior do q 20 horas')
                    retorno[y + 3] = valueHour[x].dataValues.soma
                  } else {
                    var retornoInt = parseInt(retorno[y])
                    var retornoBanco = parseInt(valueHour[x].dataValues.soma)
                    var soma = retornoInt + retornoBanco

                    // console.log('Valor do retorno Int: ' + retornoInt)
                    // console.log('Valor do retorno Int2: ' + retornoBanco)
                    if (horaIni > 0 && horaFim > 0) {
                      if (soma <= 255) {
                        retorno[y] = soma // Substituimos o valor do array
                      } else {
                        retorno[y] = retornoBanco
                      }
                    }
                  }
                }
              }
            }
            byte++ // Incrementamos a variável byte dentro do segundo for
            y === retorno.length - 1 ? (virgula = '') : (virgula = ',')
            arrayString = arrayString + retorno[y] + virgula
          }
          i = i + 2 // Sempre incrementamos o i para o primeiro for correr de 3 em 3
          dia++ // Incrementamos a variável dia
        }

        // console.log(`Retorno depois de modificado: ${retorno}`)
        // console.log(`Valor do array de string: ${arrayString}`)
        /**
         * Aqui chamamos o script powershell que modificará a hora do usuário
         */
        ps.addCommand(
          `${Path.resolve(
            'src',
            'scripts',
            'script_setUserHour.ps1'
          )} ${usuario} ${arrayString}`
        )
        ps.invoke()
          .then(output => {
            res.send({ status: 200, message: 'Dados atualizados com sucesso!' })
          })
          .catch(err => {
            console.log(err)
            ps.dispose()
          })
      })
      .catch(err => {
        console.log('Erro: ' + err)
      })

    // Retornamos o valor para o Front End
  }
}

module.exports = new HourController()
