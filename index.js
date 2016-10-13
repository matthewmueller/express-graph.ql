/**
 * Module Dependencies
 */

var body = require('body-parser')

/**
 * Export `middleware`
 */

module.exports = middleware

/**
 * Setup middleware
 *
 * @param {Schema|Function} schema_or_fn
 * @return {Function}
 */

function middleware (schema_or_fn) {
  return function (req, res, next) {
    var schema = schema_or_fn.name !== 'query'
      ? schema_or_fn(req, res, next)
      : schema_or_fn

    if (req.method === 'GET') {
      return next(new Error('express-graph.ql does not support GET requests yet'))
    }

    // parse the request body if we haven't already
    if (!req.body) body.json()(req, res, run)
    else run()

    // run the query against our schema
    function run () {
      schema(req.body.query, variables(req.body.variables))
        .then(function (data) {
          if (data.errors) {
            return res.send({
              errors: data.errors.map(function (error) {
                return error.stack
              })
            })
          } else {
            res.send(data)
          }
        })
    }
  }
}

/**
 * Coerce variables
 *
 * @param {Mixed} vars
 * @return {Object}
 */

function variables (vars) {
  if (!vars) return {}
  if (typeof vars === 'string') return JSON.parse(vars)
  return vars
}
