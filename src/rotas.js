const express = require('express')
const pool = require('./conexao')
const verificarUsuarioLogado = require('./intermediarios/autenticacao')
const {
    cadastrarUsuario,
    login,
    detalharPerfilUsuario,
    editarPerfilUsuario } = require('./controladores/usuario')
const {
    listarCategorias,
    listarTransacoes,
    detalharTransacao,
    cadastrarTransacao,
    editarTransacao,
    removerTransacao,
    extratoDasTransacoes,
    filtrarTransacoes
} = require('./controladores/transacoes')

const rotas = express()

// USUARIOS NAO LOGADOS
rotas.post('/usuario', cadastrarUsuario)
rotas.post('/login', login)

// USUARIOS LOGADOS
rotas.use(verificarUsuarioLogado)
rotas.get('/usuario', detalharPerfilUsuario)
rotas.put('/usuario', editarPerfilUsuario)

// TRANSACOES (REQUER LOGIN)
rotas.get('/categorias', listarCategorias)
// rotas.get('/transacao', listarTransacoes) => Substituida por filtrarTransacoes
rotas.get('/transacao/extrato', extratoDasTransacoes)
rotas.get('/transacao/:id', detalharTransacao)
rotas.post('/transacao', cadastrarTransacao)
rotas.put('/transacao/:id', editarTransacao)
rotas.delete('/transacao/:id', removerTransacao)

// Desafio Extra - Filtrar transações por categoria
// GET / transacao ? filtro[] = roupas & filtro[]=salários
rotas.get('/transacao', filtrarTransacoes)

module.exports = rotas