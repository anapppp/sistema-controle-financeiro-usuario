const jwt = require('jsonwebtoken')
const senhaJwt = require('../senhaJwt')
const pool = require('../conexao')

const verificarUsuarioLogado = async (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1]
    try {
        //Verificando o token
        const { id } = jwt.verify(token, senhaJwt)
        const { rows, rowCount } = await pool.query('select * from usuarios where id  =$1', [id])
        if (rowCount < 1) { return res.status(401).json({ mensagem: "Não autorizado." }) }
        //Armazenando usuario na req para ser utilizado nas proximas rotas
        req.usuario = rows[0]
        next()
    } catch (error) {
        return res.status(401).json({ mensagem: 'Nao autorizado' })
    }
}

module.exports = verificarUsuarioLogado

