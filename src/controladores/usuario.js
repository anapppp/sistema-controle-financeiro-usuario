const pool = require('../conexao')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const senhaJwt = require('../senhaJwt')

const validarCamposObrigatorios = async (dados, camposObrigatorios) => {
    let mensagem = []
    for (let i of camposObrigatorios) {
        if (!dados[i]) {
            mensagem.push(`O campo ${i} é obrigatório.`)
        }
    }
    return mensagem
}

const buscarUsuario = async ({ id, nome, email }) => {
    let usuario = undefined
    if (id) {
        usuario = await pool.query('select * from usuarios where id = $1', [id])
    } else if (email) {
        usuario = await pool.query('select * from usuarios where email = $1', [email])
    } else if (nome) {
        usuario = await pool.query('select * from usuarios where nome = $1', [nome])
    }
    return usuario.rows[0];
}
/*---------------------------------------------------------------------------------------------------------*/

const cadastrarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body
    const camposObrigatorios = ['nome', 'email', 'senha']

    try {
        const msgCamposObrigatorios = await validarCamposObrigatorios({ nome, email, senha }, camposObrigatorios)
        if (msgCamposObrigatorios.length > 0) {
            return res.status(400).json({ mensagem: msgCamposObrigatorios }) // campo obrigatorio nao preenchido
        }

        const buscaUsuario = await buscarUsuario({ email })
        if (buscaUsuario !== undefined)
            return res.status(409).json({ mensagem: 'E-mail já cadastrado' })

        const senhaCriptografada = await bcrypt.hash(senha, 10)
        const { rows } = await pool.query(
            'insert into usuarios (nome, email, senha) values ($1, $2, $3) returning *',
            [nome, email, senhaCriptografada]
        )
        return res.status(201).json({
            "id": rows[0].id,
            "nome": rows[0].nome,
            "email": rows[0].email
        });
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' })
    }
}

const login = async (req, res) => {
    const { email, senha } = req.body
    const camposObrigatorios = ['email', 'senha']
    try {
        const msgCamposObrigatorios = await validarCamposObrigatorios({ email, senha }, camposObrigatorios)
        if (msgCamposObrigatorios.length > 0)
            return res.status(400).json({ mensagem: msgCamposObrigatorios }) // campo obrigatorio nao preenchido
        const usuario = await buscarUsuario({ email })
        if (usuario == undefined)
            return res.status(404).json({ mensagem: 'E-mail não cadastrado' })
        // validando e-mail e senha
        const senhaValida = await bcrypt.compare(senha, usuario.senha)
        if (!senhaValida)
            return res.status(401).json({ mensagem: "E-mail e/ou senha inválidos." })
        // gerando token
        const token = jwt.sign({ id: usuario.id }, senhaJwt)
        const { senha: _, ...usuarioLogado } = usuario
        return res.json({ token, usuario: usuarioLogado })
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' })
    }
}

const detalharPerfilUsuario = async (req, res) => {
    try {
        const { senha: _, ...usuarioLogado } = req.usuario
        return res.json(usuarioLogado)   // usuario retornado de src/intermediarios/autenticacao/verificarUsuarioLogado
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' })
    }
}

const editarPerfilUsuario = async (req, res) => {
    const { nome, email, senha } = req.body
    const camposObrigatorios = ['nome', 'email', 'senha']
    try {
        const msgCamposObrigatorios = await validarCamposObrigatorios({ nome, email, senha }, camposObrigatorios)
        if (msgCamposObrigatorios.length > 0) {
            return res.status(400).json({ mensagem: msgCamposObrigatorios }) // campo obrigatorio nao preenchido
        }

        const buscaUsuario = await buscarUsuario({ email })
        if (buscaUsuario.id !== req.usuario.id)
            return res.status(409).json({ mensagem: 'E-mail já cadastrado em outra conta.' })

        const senhaCriptografada = await bcrypt.hash(senha, 10)
        await pool.query(
            'update usuarios set nome = $1, email = $2, senha = $3 where id = $4',
            [nome, email, senhaCriptografada, req.usuario.id])
        return res.status(204).send()
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' })
    }
}

module.exports = {
    cadastrarUsuario,
    login,
    detalharPerfilUsuario,
    editarPerfilUsuario
}