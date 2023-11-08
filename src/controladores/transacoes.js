const pool = require('../conexao')

const listarCategorias = async (req, res) => {
    try {
        const categorias = await pool.query(`SELECT * FROM categorias;`)
        return res.send(categorias.rows)
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' })
    }
}

const listarTransacoes = async (req, res) => {
    const id_usuario = req.usuario.id
    try {
        const query = `
        SELECT
        t.id,
        t.tipo,
        t.descricao,
        t.valor,
        t.data,
        t.usuario_id,
        t.categoria_id,
        c.descricao AS categoria_nome
        FROM transacoes AS t
        INNER JOIN categorias AS c ON t.categoria_id = c.id
        WHERE t.usuario_id = $1;
        `
        resultado = await pool.query(query, [id_usuario])
        return res.send(resultado.rows)
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' })
    }
}

const detalharTransacao = async (req, res) => {
    const id_usuario = req.usuario.id
    const { id } = req.params

    try {
        const query = `
        SELECT
        t.id,
        t.tipo,
        t.descricao,
        t.valor,
        t.data,
        t.usuario_id,
        t.categoria_id,
        c.descricao AS categoria_nome
        FROM transacoes AS t
        INNER JOIN categorias AS c ON t.categoria_id = c.id
        WHERE t.usuario_id = $1
        AND t.id = $2;
        `
        resultado = await pool.query(query, [id_usuario, id])
        if (resultado.rows.length < 1) {
            return res.status(404).json({ mensagem: "Transação não encontrada." })
        }
        return res.send(resultado.rows)
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' })
    }
}

const cadastrarTransacao = async (req, res) => {
    const id_usuario = req.usuario.id
    const { descricao, valor, data, categoria_id, tipo } = req.body
    if (!descricao && !valor && !data && !categoria_id && !tipo) {
        return res.status(400).json({ mensagem: 'Todos os campos obrigatórios devem ser informados.' })
    }
    if (tipo !== 'entrada' && tipo !== 'saida') {
        return res.status(400).json({ mensagem: "O campo 'tipo' deve ser 'entrada' ou 'saida'!" })
    }

    try {
        const exiteCategoria = await pool.query(`SELECT descricao FROM categorias WHERE id = ${categoria_id};`)
        if (exiteCategoria.rows.length < 0) {
            return res.status(400).json({ mensagem: 'Não exite categoria para o categoria_id informado' })
        }

        const query = `
                WITH insere_transacao AS(
                INSERT INTO transacoes(descricao, valor, data, categoria_id, usuario_id, tipo)
                VALUES($1, $2, $3, $4, $5, $6)
                RETURNING id, tipo, descricao, valor, data, usuario_id, categoria_id)
                SELECT
                it.id,
                it.tipo,
                it.descricao,
                it.valor,
                it.data,
                it.usuario_id,
                it.categoria_id,
                c.descricao AS categoria_nome
                FROM insere_transacao AS it
                INNER JOIN categorias AS c ON it.categoria_id = c.id
                WHERE it.usuario_id = $5
                AND it.id = (SELECT max(id) FROM insere_transacao);
                `;

        resultado = await pool.query(query, [descricao, valor, data, categoria_id, id_usuario, tipo])
        return res.status(201).send(resultado.rows)
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' })
    }
}

const editarTransacao = async (req, res) => {
    const id_usuario = req.usuario.id
    const { id } = req.params
    const { descricao, valor, data, categoria_id, tipo } = req.body
    if (!descricao && !valor && !data && !categoria_id && !tipo) {
        return res.status(400).json({ mensagem: 'Todos os campos obrigatórios devem ser informados.' })
    }
    if (tipo !== 'entrada' && tipo !== 'saida') {
        return res.status(400).json({ mensagem: "O campo 'tipo' deve ser 'entrada' ou 'saida'!" })
    }

    try {
        const existeTransacao = await pool.query(`SELECT * FROM transacoes WHERE id = ${id} AND usuario_id = ${id_usuario};`)
        if (existeTransacao.rows.length < 1) {
            return res.status(404).json({ mensagem: "Transação não encontrada." })
        }
        const exiteCategoria = await pool.query(`SELECT descricao FROM categorias WHERE id = ${categoria_id};`)
        if (exiteCategoria.rows.length < 0) {
            return res.status(400).json({ mensagem: 'Não exite categoria para o categoria_id informado' })
        }

        const query = `
               UPDATE transacoes
               SET
                descricao = $1,
                valor = $2,
                data = $3,
                categoria_id = $4,
                usuario_id = $5,
                tipo = $6
                WHERE id = $7;
                `;
        resultado = await pool.query(query, [descricao, valor, data, categoria_id, id_usuario, tipo, id])
        return res.status(201).send()
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' })
    }
}

const removerTransacao = async (req, res) => {
    const id_usuario = req.usuario.id
    const { id } = req.params
    try {
        const existeTransacao = await pool.query(`SELECT * FROM transacoes WHERE id = ${id} AND usuario_id = ${id_usuario};`)
        if (existeTransacao.rows.length < 1) {
            return res.status(404).json({ mensagem: "Transação não encontrada." })
        }
        const query = `
               DELETE FROM transacoes
               WHERE id = $1;
                `;
        resultado = await pool.query(query, [id])
        return res.send()
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' })
    }
}

const extratoDasTransacoes = async (req, res) => {
    const id_usuario = req.usuario.id
    try {
        const query = `
            SELECT
            COALESCE(SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END), 0) AS entrada,
            COALESCE(SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END), 0) AS saida
            FROM transacoes
            WHERE usuario_id = $1;
                `;
        const resultados = await pool.query(query, [id_usuario])
        return res.send(resultados.rows[0])
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' })
    }
}

const filtrarTransacoes = async (req, res) => {
    const id_usuario = req.usuario.id
    let { filtro } = req.query
    try {
        let query = `
        SELECT
        t.id,
        t.tipo,
        t.descricao,
        t.valor,
        t.data,
        t.usuario_id,
        t.categoria_id,
        c.descricao AS categoria_nome
        FROM transacoes AS t
        INNER JOIN categorias AS c ON t.categoria_id = c.id
        WHERE t.usuario_id = $1
        `
        // Modificando a query caso algo tenha sido passado em filtro=[]
        if (filtro !== undefined) {
            query += ` AND (`
            let numFiltro = 0
            while (numFiltro < filtro.length - 1) {
                query += `c.descricao ilike $${(numFiltro + 2)} or `
                numFiltro++
            }
            query += `c.descricao ilike $${(numFiltro + 2)})`
        } else {
            filtro = []
        }

        resultado = await pool.query(query, [id_usuario, ...filtro])
        return res.send(resultado.rows)
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' })
    }
}

module.exports = {
    listarCategorias,
    listarTransacoes,
    detalharTransacao,
    cadastrarTransacao,
    editarTransacao,
    removerTransacao,
    extratoDasTransacoes,
    filtrarTransacoes
}